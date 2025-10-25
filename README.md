# Phishblock Frontend
This is the frontend interface for the Phishblock V4 (Version 4) smart contract, built for the BloackQuest hackathon (Track 4: Blockchain X Cybersecurity).

## Problem
Phishing attacks are a major cybersecurity threat.

## Solution: Phishblock V4
Phishblock is a decentralized, community-driven database of reported phishing links stored on the Polygon Amoy testnet.

**Key Features:**
* **Decentralized Storage:** Reports are stored immutably on the blockchain.
* **Stake-and-Slash Mechanism:**
    * Users must stake 0.01 MATIC to submit a report, preventing spam.
    * The community votes (upvote/downvote) on submitted reports.
    * If a report receives enough votes (threshold: 5) and has more upvotes than downvotes, it's considered valid, and the reporter's stake is refunded.
    * If a report is resolved with more downvotes, it's considered spam, and the reporter's stake is "slashed" (kept by the contract).
* **Community Validation:** Ensures the integrity of the reported data through collective voting.
* **Owner Withdrawal:** Slashed funds can be withdrawn by the contract owner.

## Demo
* **Live Frontend:** [Paste Your Replit Deployed Link Here]
* **Smart Contract (Amoy):** [Paste Your PhishblockV4 Contract Address Here]
* **Video Walkthrough:** [Link to Your Demo Video Here]

## How to Use
1.  Visit the Deployed Link.
2.  Connect your MetaMask wallet (ensure it's on the Polygon Amoy testnet).
3.  Use the interface to submit reports (requires 0.01 Amoy MATIC stake), view reports, vote, and resolve reports.

## Built With
* **Smart Contract:** Solidity, Remix IDE
* **Frontend:** HTML, CSS, JavaScript (with Ethers.js), Replit
* **Blockchain:** Polygon Amoy Testnet
