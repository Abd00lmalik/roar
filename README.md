# RoarTube
Live url:https://roartube.vercel.app

**Where football attention becomes creator revenue and fan rewards on OKX X Layer.**

RoarTube is a World Cup themed, pay-per-second football video platform designed to build an open media infrastructure. It eliminates traditional video ads completely, replacing them with a high velocity micro billing streaming highway. Fans pay fractions of a cent only for the exact seconds they actively watch, content creators get paid directly and instantly and viewers are financially rewarded for participating in the digital stadium ecosystem.

---

## Core Concept & Economic Design

Traditional video platforms force users to watch unskippable ads while centralized corporations capture all the economic value. Roarball realigns these incentives by metering attention directly on the blockchain.

Every new user profile receives a global **2-minute (120-second) free pass allowance** to explore the ecosystem. The moment this free pool is exhausted, playback automatically pauses, and the system prompts the user to clear active streaming tokens by funding their built-in app wallet with USDC. From that point forward, streaming content costs exactly **0.001 USDC per second** ($0.06 per minute).

### The Precision Telemetry State Machine
To guarantee absolute consumer transparency, Roarball implements an aggressive tracking observer on the client video layer. The exact millisecond a user clicks pause, encounters network buffering, switches browser tabs (`document.hidden`), or navigates away from the active route, the session tracking clock stops and the billing engine freezes instantly. Users never pay for a single second of unattended stream time.

### The Protocol Fee Split
Every paid second of human attention processed by the streaming platform triggers an un-gameable, atomic three-way split directly on the blockchain ledger:

| Fee Split Metric | Destination Target | Protocol Action |
| :--- | :--- | :--- |
| **85% Base Cut** | Content Creator Wallet | Transferred instantly to the video owner's claimable ledger balance for real-time monetization. |
| **10% Allocation** | Fan Rewards Pool | Deposited directly to a collective ecosystem contract on X Layer to reward active viewers and top-performing country stands. |
| **5% Platform Cut** | Platform Treasury | Routed to the system administrative wallet to systematically subsidize automated backend infrastructure gas overhead. |

---

## 🛠️ Dual-Engine Architecture

Processing financial transactions every single second directly on-chain is impossible due to network congestion, latency, and volatile gas overhead. Roarball solves this scaling bottleneck by utilizing a specialized dual-engine hybrid architecture that splits execution by engineering strength:


```

[ HIGH-SPEED COMMERCE HIGHWAY ]             [ SOVEREIGN REPUTATION & GOVERNANCE ]
Circle Nanopayments                           OKX X Layer Testnet
(Supported Foundation L2)                          (Chain ID 1952)
||                                            ||
Processes gasless, off-chain EIP-3009         Hosts Fan Passports & Staking Vaults
and EIP-712 streaming signatures.             Mints Trophy Badges (ERC1155 NFTs)

```

### 1. The Micro-Commerce Engine (Circle Nanopayments)
This layer handles the high-frequency streaming micro-payments. It utilizes secure off-chain cryptographic handshakes via **EIP-3009 gasless signatures** and **EIP-712 session vouchers** executed inside an enclave environment. This tracks balance metrics seamlessly down to $0.000001 per playback tick without broadcasting transaction spam to the ledger on every second.

### 2. The Sovereign Governance Engine (OKX X Layer)
This network serves as the secure master control center for identity, community game loops, and system rules. Operating on the **OKX X Layer Testnet (Chain ID 1952)** using native **OKB** for gas, this layer handles user onboarding, country stand commitments, the master Fan Rewards Pool distributions, and permanent achievement trophy minting.

---

##Non-Creator & Ecosystem Features

Roarball is built intentionally to benefit everyday viewers, non-creators, and ecosystem participants alongside video publishers.

### The Fan Passport & Dynamic Flag Themes
Upon entering the stadium, users are required to commit their profile to one of the **48 qualified countries for the FIFA World Cup 2026** (All non-qualifying nations, such as Nigeria, have been completely removed from the protocol arrays). 

The exact millisecond a fan selects their flag stand, the engine injects that country's hex codes straight into the HTML root layer as dynamic CSS variables:
```css
:root {
  --country-from: var(--selected-gradient-start);
  --country-via: var(--selected-gradient-mid);
  --country-to: var(--selected-gradient-end);
  --country-accent: var(--selected-glow);
}

```

The entire application layout—including navigation structures, glassmorphic card borders, text highlights, and video player seek bars—instantly shifts colors to match national team flag gradients.

### Zero-Friction Embedded Wallet Provisioning

To capture mainstream Web2 consumers, the app completely eliminates the onboarding friction of seed phrases, external browser extensions, or upfront gas requirements. Users click a single button to sign in with a standard Google account. Once the OAuth session verifies, the server utility instantly instantiates a secure **Circle Embedded Smart Wallet** mapped directly to that unique profile behind the scenes.

### The "Away Fan Tax" & Staking Multipliers

A user's streaming cost is dynamically adjusted based on their on-chain state verified on X Layer.

* **Home Stand Discount:** Fans who stake native OKB into their selected country vault unlock loyalty multipliers, dropping their streaming cost via Circle Nanopayments to **0.0005 USDC/second**.
* **Away Fan Tax:** If a fan watches a video published by a rival country stand without holding a matching passport pass, the payment engine levies a 2x fee penalty (**0.002 USDC/second**).

### Watch-to-Earn Rewards & Match Takes

Everyday viewers are financially incentivized to contribute to the stadium atmosphere. By submitting structured **Match Takes** (categorized explicitly as *Tactical, Banter, Hot Take,* or *Disagree*) and engaging with content, fans accumulate reputation points, climb leaderboards, and programmatically claim distributions from the **10% Fan Rewards Pool** alongside on-chain **Trophy Badges (ERC-1155 NFTs)**.

### Decentralized Video Assistant Referee (VAR)

To maintain platform integrity without relying on centralized censorship, community members can lock a small amount of OKB to trigger an on-chain **VAR Copyright/Infringement Challenge**. The passport ecosystem votes using their reputation weights. If consensus determines a violation has occurred, the video index is instantly burned on X Layer, and the platform worker instantly drops the signature router on Circle, freezing the creator's earnings mid-flight.

---


```
