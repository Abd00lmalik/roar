create extension if not exists "uuid-ossp";

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text unique not null,
  display_name text not null,
  handle text unique not null,
  avatar_url text,
  bio text,
  country_code text not null,
  country_name text not null,
  country_locked boolean not null default false,
  cumulative_free_seconds_used integer not null default 0,
  created_at timestamptz not null default now()
);

create table countries (
  code text primary key,
  name text not null,
  flag_emoji text not null,
  gradient_from text not null,
  gradient_to text not null,
  gradient_accent text not null
);

create table videos (
  id uuid primary key default uuid_generate_v4(),
  owner_profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  cloudflare_video_uid text,
  thumbnail_url text,
  duration_seconds integer,
  category text not null,
  country_tags text[] default '{}',
  content_type text not null check (content_type in ('short','long')),
  status text not null default 'active' check (status in ('active','flagged','hidden','removed')),
  total_watch_seconds bigint not null default 0,
  total_billable_seconds bigint not null default 0,
  created_at timestamptz not null default now()
);

create table watch_sessions (
  id uuid primary key default uuid_generate_v4(),
  viewer_profile_id uuid references profiles(id),
  creator_profile_id uuid references profiles(id),
  video_id uuid references videos(id),
  total_seconds integer not null default 0,
  free_seconds_used integer not null default 0,
  billable_seconds integer not null default 0,
  amount_usdc numeric(20,6) not null default 0,
  creator_share numeric(20,6) not null default 0,
  platform_share numeric(20,6) not null default 0,
  reward_pool_share numeric(20,6) not null default 0,
  tx_hash text,
  status text not null default 'free' check (status in ('free','settled','pending_settlement','failed')),
  created_at timestamptz not null default now()
);

create table balances (
  profile_id uuid primary key references profiles(id),
  claimable_creator_usdc numeric(20,6) not null default 0,
  total_withdrawn_usdc numeric(20,6) not null default 0,
  total_spent_usdc numeric(20,6) not null default 0,
  updated_at timestamptz not null default now()
);

create table badges (
  id serial primary key,
  slug text unique not null,
  name text not null,
  description text not null,
  requirement_type text not null,
  requirement_value integer not null default 1,
  icon text not null,
  contract_badge_id integer,
  created_at timestamptz not null default now()
);

create table user_badges (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),
  badge_id integer references badges(id),
  tx_hash text,
  is_on_chain boolean not null default false,
  claimed_at timestamptz not null default now(),
  unique(profile_id, badge_id)
);

create table comments (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) on delete cascade,
  profile_id uuid references profiles(id),
  content text not null,
  created_at timestamptz not null default now()
);

create table reactions (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) on delete cascade,
  profile_id uuid references profiles(id),
  reaction_type text not null check (reaction_type in ('hot_take','great_analysis','banter','tactical','disagree','lift_the_cup')),
  created_at timestamptz not null default now(),
  unique(video_id, profile_id, reaction_type)
);

create table follows (
  id uuid primary key default uuid_generate_v4(),
  follower_profile_id uuid references profiles(id),
  followed_profile_id uuid references profiles(id),
  followed_country_code text references countries(code),
  created_at timestamptz not null default now(),
  check (
    (followed_profile_id is not null and followed_country_code is null) or
    (followed_profile_id is null and followed_country_code is not null)
  )
);

create table saved_videos (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),
  video_id uuid references videos(id),
  created_at timestamptz not null default now(),
  unique(profile_id, video_id)
);

create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_profile_id uuid references profiles(id),
  video_id uuid references videos(id),
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at timestamptz not null default now()
);

create table platform_stats (
  id integer primary key default 1,
  total_watch_seconds bigint not null default 0,
  total_billable_seconds bigint not null default 0,
  total_volume_usdc numeric(20,6) not null default 0,
  fan_rewards_pool_usdc numeric(20,6) not null default 0,
  platform_revenue_usdc numeric(20,6) not null default 0,
  updated_at timestamptz not null default now()
);
insert into platform_stats (id) values (1) on conflict do nothing;

alter table profiles enable row level security;
alter table videos enable row level security;
alter table watch_sessions enable row level security;
alter table balances enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table follows enable row level security;
alter table saved_videos enable row level security;
alter table reports enable row level security;

create policy "public read profiles" on profiles for select using (true);
create policy "public read videos" on videos for select using (status = 'active');
create policy "public read comments" on comments for select using (true);
create policy "public read reactions" on reactions for select using (true);
create policy "public read countries" on countries for select using (true);
create policy "public read badges" on badges for select using (true);
create policy "public read user_badges" on user_badges for select using (true);
create policy "public read leaderboard stats" on platform_stats for select using (true);

insert into countries values
  ('NG','Nigeria','🇳🇬','#008751','#FFFFFF','#00C853'),
  ('BR','Brazil','🇧🇷','#009C3B','#FFDF00','#002776'),
  ('AR','Argentina','🇦🇷','#74ACDF','#FFFFFF','#F6B40E'),
  ('FR','France','🇫🇷','#002395','#FFFFFF','#ED2939'),
  ('MA','Morocco','🇲🇦','#C1272D','#006233','#FFD700'),
  ('GH','Ghana','🇬🇭','#006B3F','#FCD116','#CE1126'),
  ('EN','England','🏴','#FFFFFF','#CF091D','#012169'),
  ('PT','Portugal','🇵🇹','#006600','#FF0000','#FFD700'),
  ('ES','Spain','🇪🇸','#AA151B','#F1BF00','#AA151B'),
  ('DE','Germany','🇩🇪','#000000','#DD0000','#FFCE00'),
  ('US','USA','🇺🇸','#002868','#BF0A30','#FFFFFF'),
  ('MX','Mexico','🇲🇽','#006847','#FFFFFF','#CE1126'),
  ('JP','Japan','🇯🇵','#FFFFFF','#BC002D','#FFFFFF'),
  ('KR','South Korea','🇰🇷','#FFFFFF','#003478','#CD2E3A'),
  ('SN','Senegal','🇸🇳','#00853F','#FDEF42','#E31B23'),
  ('CM','Cameroon','🇨🇲','#007A5E','#CE1126','#FCD116');

insert into badges (slug,name,description,requirement_type,requirement_value,icon,contract_badge_id) values
  ('first_roar','First Roar','You watched your first video on Roar','videos_watched',1,'🏆',1),
  ('first_upload','First Upload','You entered the pitch and uploaded your first video','videos_uploaded',1,'⚽',2),
  ('matchday_viewer','Matchday Viewer','Watched a matchday-tagged video','matchday_watch',1,'📅',3),
  ('10_min_fan','10-Minute Fan','Watched 10 total minutes on Roar','total_watch_minutes',10,'⏱️',4),
  ('30_min_fan','30-Minute Fan','Watched 30 total minutes on Roar','total_watch_minutes',30,'🎽',5),
  ('90_min_fan','90-Minute Fan','Watched a full 90 minutes — true fan','total_watch_minutes',90,'🥇',6),
  ('country_loyalist','Country Loyalist','Followed your chosen country feed','country_follow',1,'🌍',7),
  ('creator_supporter','Creator Supporter','Watched 5 minutes from a single creator','creator_watch_minutes',5,'🤝',8),
  ('tactical_mind','Tactical Mind','Watched 3 tactical breakdown videos','tactical_watched',3,'🧠',9),
  ('banter_king','Banter King','Reacted with Banter 10 times','banter_reactions',10,'😂',10),
  ('hot_take_merchant','Hot Take Merchant','Used Hot Take reaction 10 times','hot_take_reactions',10,'🌶️',11),
  ('early_member','Early Stadium Member','Joined during the Global Cup Festival launch period','signup_during_hackathon',1,'⭐',12);

insert into profiles (id,wallet_address,display_name,handle,bio,country_code,country_name,country_locked,cumulative_free_seconds_used) values
  ('11111111-0000-0000-0000-000000000001','0x0000000000000000000000000000000000000001','Tactical Ghost','TacticalGhost','Breaking down football systems one frame at a time.','FR','France',true,0),
  ('11111111-0000-0000-0000-000000000002','0x0000000000000000000000000000000000000002','Pitch Lens','PitchLens','Film room analysis for football nerds worldwide.','DE','Germany',true,0),
  ('11111111-0000-0000-0000-000000000003','0x0000000000000000000000000000000000000003','Naija Stand','NaijaStand','Nigeria to the world. Super Eagles forever.','NG','Nigeria',true,0),
  ('11111111-0000-0000-0000-000000000004','0x0000000000000000000000000000000000000004','Copa Mind','CopaMind','Argentina hearts. Tactical brilliance. Football poetry.','AR','Argentina',true,0),
  ('11111111-0000-0000-0000-000000000005','0x0000000000000000000000000000000000000005','Fan Zone HQ','FanZoneHQ','The fans perspective. Every match. Every emotion.','BR','Brazil',true,0),
  ('11111111-0000-0000-0000-000000000006','0x0000000000000000000000000000000000000006','Matchday Musa','MatchdayMusa','Matchday coverage from the stands. Pure atmosphere.','NG','Nigeria',true,0);

insert into videos (id,owner_profile_id,title,description,video_url,thumbnail_url,duration_seconds,category,country_tags,content_type,status,total_watch_seconds,total_billable_seconds) values
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000003','Nigeria vs Brazil: The Midfield Battle','A deep dive into the midfield chess match. NaijaStand breaks down every press, every interception.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/ngbr/640/360',847,'Tactical Breakdowns',ARRAY['NG','BR'],'long','active',12400,8200),
  ('aaaaaaaa-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','Argentina Pressing Shape Explained','Frame-by-frame breakdown of how Argentina suffocate possession. Pure tactical cinema.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/arpress/640/360',612,'Tactical Breakdowns',ARRAY['AR'],'long','active',9800,6500),
  ('aaaaaaaa-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000002','Morocco Low Block Masterclass','Atlas Lions defend with discipline. Here is exactly why it works against any attack.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/mablock/640/360',540,'Tactical Breakdowns',ARRAY['MA'],'long','active',7200,4900),
  ('aaaaaaaa-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000003','England Fans After the Final Whistle','Pure emotion. Raw fan footage from the stands after a dramatic equalizer. History made.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/enfans/640/360',92,'Fan Reactions',ARRAY['EN'],'short','active',15600,11200),
  ('aaaaaaaa-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001','France vs Portugal: Matchday Preview','Mbappé versus Bruno. Which system wins? Our complete tactical preview before kickoff.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/frpt/640/360',720,'Match Previews',ARRAY['FR','PT'],'long','active',11000,7400),
  ('aaaaaaaa-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000003','Ghana Supporters Roar After Late Winner','96th minute winner. This is what football is for. Accra erupts.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/ghwin/640/360',74,'Fan Reactions',ARRAY['GH'],'short','active',18200,13800),
  ('aaaaaaaa-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000005','Brazil Wing Play in 90 Seconds','Vinicius, Rodrygo, the overlap. Brazil wide attack in one dazzling 90-second edit.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/brwing/640/360',90,'Banter Clips',ARRAY['BR'],'short','active',22000,16500),
  ('aaaaaaaa-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000002','Japan Counterattack Blueprint','The samurai blueprint. How Japan wins against sides with 70% possession. Unmissable.','https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4','https://picsum.photos/seed/jpcount/640/360',480,'Tactical Breakdowns',ARRAY['JP'],'long','active',5900,3400);

update platform_stats set
  total_watch_seconds = 102100,
  total_billable_seconds = 71900,
  total_volume_usdc = 71.9,
  fan_rewards_pool_usdc = 7.19,
  platform_revenue_usdc = 3.595
where id = 1;
