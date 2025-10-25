const contractAddress = "0x6C3DAb0353d0BF2f36F69F4a642dE5eC99a42A";
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_cid",
                "type": "string"
            }
        ],
        "name": "createReport",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "resolveReport",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_upvote",
                "type": "bool"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawSlashedFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "hasVoted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "reportCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "reports",
        "outputs": [
            {
                "internalType": "string",
                "name": "cid",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "reporter",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "upvotes",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "downvotes",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "stakedAmount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isResolved",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stakeAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "VOTE_THRESHOLD",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const ADMIN_PASSWORD = "2306";

let provider;
let signer;
let contract;
let ownerAddress = null;
let currentUserAddress = null;

const connectSection = document.getElementById('connectSection');
const appSection = document.getElementById('appSection');
const adminLoginSection = document.getElementById('adminLoginSection');
const adminSection = document.getElementById('adminSection');

const connectButton = document.getElementById('connectButton');
const connectStatus = document.getElementById('connectStatus');
const showAdminLoginButton = document.getElementById('showAdminLoginButton');

const walletAddressDisplay = document.getElementById('walletAddress');
const loadReportsButton = document.getElementById('loadReportsButton');
const reportList = document.getElementById('reportList');
const cidInput = document.getElementById('cidInput');
const submitReportButton = document.getElementById('submitReportButton');
const submitStatusDisplay = document.getElementById('submitStatus');
const logoutButton = document.getElementById('logoutButton');

const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginButton = document.getElementById('adminLoginButton');
const adminLoginStatus = document.getElementById('adminLoginStatus');
const backToConnectButton = document.getElementById('backToConnectButton');

const withdrawButton = document.getElementById('withdrawButton');
const withdrawStatusDisplay = document.getElementById('withdrawStatus');
const adminLogoutButton = document.getElementById('adminLogoutButton');

connectButton.addEventListener('click', connectWallet);
logoutButton.addEventListener('click', disconnectWallet);
loadReportsButton.addEventListener('click', loadReports);
submitReportButton.addEventListener('click', submitReport);
showAdminLoginButton.addEventListener('click', showAdminLogin);
adminLoginButton.addEventListener('click', handleAdminLogin);
backToConnectButton.addEventListener('click', showConnectSection);
withdrawButton.addEventListener('click', withdrawSlashedFunds);
adminLogoutButton.addEventListener('click', showConnectSection);

function showSection(sectionToShow) {
    [connectSection, appSection, adminLoginSection, adminSection].forEach(section => {
        if (section) section.style.display = 'none';
    });
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }
}

function showConnectSection() {
    showSection(connectSection);
    connectStatus.textContent = '';
    adminLoginStatus.textContent = '';
    adminPasswordInput.value = '';
}

function showAdminLogin() {
    showSection(adminLoginSection);
    adminLoginStatus.textContent = '';
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        connectStatus.textContent = 'Please install MetaMask!';
        return;
    }

    connectStatus.textContent = 'Connecting... Please approve in MetaMask.';
    connectButton.disabled = true;

    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        currentUserAddress = await signer.getAddress();
        console.log("Account Connected:", currentUserAddress);

        contract = new ethers.Contract(contractAddress, contractABI, signer);

        try {
            ownerAddress = await contract.owner();
            console.log("Contract Owner:", ownerAddress);
        } catch (ownerError) {
            console.error("Could not fetch owner address:", ownerError);
            connectStatus.textContent = 'Error fetching contract owner. Refresh and try again.';
            connectButton.disabled = false;
            return;
        }

        showSection(appSection);
        walletAddressDisplay.textContent = `Connected: ${currentUserAddress.substring(0, 6)}...${currentUserAddress.substring(currentUserAddress.length - 4)}`;
        loadReportsButton.disabled = false;
        submitStatusDisplay.textContent = '';
        connectButton.disabled = false;

        await loadReports();

    } catch (error) {
        console.error("Connection Error:", error);
        connectStatus.textContent = 'Connection failed. User rejected or error occurred.';
        connectButton.disabled = false;
        showConnectSection();
    }
}

function disconnectWallet() {
    provider = null;
    signer = null;
    contract = null;
    currentUserAddress = null;
    ownerAddress = null;
    walletAddressDisplay.textContent = 'Not Connected';
    console.log("Wallet disconnected");
    showConnectSection();
}

async function loadReports() {
    if (!contract) {
        console.error("Cannot load reports: Contract not initialized.");
        reportList.innerHTML = '<li>Error: Connect wallet first.</li>';
        return;
    }
    reportList.innerHTML = '<li><p>🔄 Loading reports from the blockchain...</p></li>';
    loadReportsButton.disabled = true;

    try {
        const count = await contract.reportCount();
        const numReports = count.toNumber();
        console.log("Total reports:", numReports);

        if (numReports === 0) {
            reportList.innerHTML = '<li><p>📬 No reports submitted yet. Be the first!</p></li>';
            loadReportsButton.disabled = false;
            return;
        }

        reportList.innerHTML = '';

        for (let i = numReports - 1; i >= 0; i--) {
            const report = await contract.reports(i);
            const listItem = document.createElement('li');
            listItem.setAttribute('data-report-id', i);
            listItem.classList.add(report.isResolved ? 'resolved' : 'active');

            listItem.innerHTML = `
                <div>
                    <b>Report ID: ${i}</b> | Status: ${report.isResolved ? '✅ Resolved' : '⏳ Active'}<br>
                    <span class="cid">CID/URL: ${report.cid}</span><br>
                    <span class="reporter">Reporter: ${report.reporter.substring(0, 6)}...${report.reporter.substring(report.reporter.length - 4)}</span><br>
                    <span class="votes">Votes: 👍 ${report.upvotes.toString()} / 👎 ${report.downvotes.toString()}</span>
                </div>
                <div class="actions">
                    <button class="upvote-btn" data-id="${i}" ${report.isResolved ? 'disabled' : ''}>Upvote 👍</button>
                    <button class="downvote-btn" data-id="${i}" ${report.isResolved ? 'disabled' : ''}>Downvote 👎</button>
                    <button class="resolve-btn" data-id="${i}" ${report.isResolved ? 'disabled' : ''}>Resolve</button>
                </div>
                <p class="status-msg" id="status-${i}"></p>
                <hr style="margin: 10px 0;">
            `;

            reportList.appendChild(listItem);

            const upvoteBtn = listItem.querySelector('.upvote-btn');
            const downvoteBtn = listItem.querySelector('.downvote-btn');
            const resolveBtn = listItem.querySelector('.resolve-btn');

            if (upvoteBtn && !report.isResolved) { upvoteBtn.addEventListener('click', () => handleVote(i, true, listItem)); }
            if (downvoteBtn && !report.isResolved) { downvoteBtn.addEventListener('click', () => handleVote(i, false, listItem)); }
            if (resolveBtn && !report.isResolved) { resolveBtn.addEventListener('click', () => resolveReport(i, listItem)); }

        }

    } catch (error) {
        console.error("Error loading reports:", error);
        reportList.innerHTML = '<li>❌ Error loading reports. Check console or try refreshing.</li>';
    } finally {
        loadReportsButton.disabled = false;
    }
}


async function submitReport() {
    if (!contract || !signer) { alert("Connect wallet first."); return; }
    const cid = cidInput.value.trim();
    if (!cid) { alert("Enter CID/URL."); return; }

    let stakeAmountWei, stakeAmountEther;
    try {
        stakeAmountWei = await contract.stakeAmount();
        stakeAmountEther = ethers.utils.formatEther(stakeAmountWei);
    } catch (e) { submitStatusDisplay.textContent = 'Error fetching stake amount.'; return; }

    const confirmed = confirm(`You are about to submit report "${cid}" and stake ${stakeAmountEther} MATIC. Proceed?`);
    if (!confirmed) { submitStatusDisplay.textContent = 'Submission cancelled.'; return; }

    submitStatusDisplay.textContent = '🚀 Preparing transaction... Please confirm in MetaMask.';
    submitReportButton.disabled = true;

    try {
        console.log("Submitting report:", cid, "with stake:", stakeAmountWei.toString());
        const tx = await contract.createReport(cid, { value: stakeAmountWei });
        submitStatusDisplay.textContent = `⏳ Transaction sent! Waiting for confirmation... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Tx Sent:", tx.hash);

        await tx.wait(1);
        submitStatusDisplay.textContent = '✅ Report submitted successfully!';
        console.log("Tx Confirmed!");
        cidInput.value = '';
        await loadReports();

    } catch (error) {
        console.error("Error submitting report:", error);
        let displayError = parseContractError(error, "Error submitting report.");
        submitStatusDisplay.textContent = displayError;
    } finally {
        submitReportButton.disabled = false;
    }
}

async function handleVote(reportIdNum, isUpvote, listItem) {
    if (!contract || !signer) { alert("Connect wallet first."); return; }

    const statusElement = listItem.querySelector('.status-msg');
    const upvoteBtn = listItem.querySelector('.upvote-btn');
    const downvoteBtn = listItem.querySelector('.downvote-btn');

    statusElement.textContent = `🚀 Preparing ${isUpvote ? 'upvote' : 'downvote'}... Confirm in MetaMask.`;
    if (upvoteBtn) upvoteBtn.disabled = true;
    if (downvoteBtn) downvoteBtn.disabled = true;

    try {
        console.log(`Voting ${isUpvote ? 'up' : 'down'} on report ID:`, reportIdNum);
        const tx = await contract.vote(reportIdNum, isUpvote);
        statusElement.textContent = `⏳ Vote sent! Waiting... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Vote Tx Sent:", tx.hash);

        await tx.wait(1);
        statusElement.textContent = '✅ Vote confirmed!';
        console.log("Vote Confirmed!");
        await loadReports();

    } catch (error) {
        console.error("Error submitting vote:", error);
        let displayError = parseContractError(error, "Error submitting vote.", "You have already voted!");
        statusElement.textContent = displayError;
        if (upvoteBtn) upvoteBtn.disabled = false;
        if (downvoteBtn) downvoteBtn.disabled = false;
    }
}

async function resolveReport(reportIdNum, listItem) {
    if (!contract || !signer) { alert("Connect wallet first."); return; }

    const statusElement = listItem.querySelector('.status-msg');
    const resolveBtn = listItem.querySelector('.resolve-btn');

    statusElement.textContent = '🚀 Preparing resolve transaction... Confirm in MetaMask.';
    if (resolveBtn) resolveBtn.disabled = true;

    try {
        console.log("Resolving report ID:", reportIdNum);
        const tx = await contract.resolveReport(reportIdNum);
        statusElement.textContent = `⏳ Resolve sent! Waiting... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Resolve Tx Sent:", tx.hash);

        await tx.wait(1);
        statusElement.textContent = '✅ Report resolved successfully!';
        console.log("Resolve Confirmed!");
        await loadReports();

    } catch (error) {
        console.error("Error resolving report:", error);
        let displayError = parseContractError(error, "Error resolving report.", "Not enough votes", "Report already resolved");
        statusElement.textContent = displayError;
        if (resolveBtn && !displayError.includes("already resolved")) resolveBtn.disabled = false;
    }
}

function handleAdminLogin() {
    const enteredPassword = adminPasswordInput.value;
    if (enteredPassword === ADMIN_PASSWORD) {
        if (currentUserAddress && ownerAddress && currentUserAddress.toLowerCase() === ownerAddress.toLowerCase()) {
            showSection(adminSection);
            withdrawStatusDisplay.textContent = '';
        } else {
            adminLoginStatus.textContent = "Error: Connected wallet is not the contract owner.";
        }
    } else {
        adminLoginStatus.textContent = "Incorrect admin code.";
    }
    adminPasswordInput.value = '';
}

async function withdrawSlashedFunds() {
    if (!contract || !signer) { alert("Connect wallet first."); return; }
    if (!currentUserAddress || !ownerAddress || currentUserAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        withdrawStatusDisplay.textContent = "Error: Only owner can withdraw."; return;
    }

    withdrawStatusDisplay.textContent = '🚀 Preparing withdraw... Confirm in MetaMask.';
    withdrawButton.disabled = true;

    try {
        console.log("Attempting withdraw...");
        const tx = await contract.withdrawSlashedFunds();
        withdrawStatusDisplay.textContent = `⏳ Withdraw sent! Waiting... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Withdraw Tx Sent:", tx.hash);
        await tx.wait(1);
        withdrawStatusDisplay.textContent = '✅ Slashed funds withdrawn successfully!';
        console.log("Withdraw Confirmed!");

    } catch (error) {
        console.error("Error withdrawing funds:", error);
        let displayError = parseContractError(error, "Error withdrawing funds.");
        if (displayError.toLowerCase().includes("transfer failed") || displayError.toLowerCase().includes("insufficient balance")) {
            displayError = "✅ No slashed funds available to withdraw currently.";
        }
        withdrawStatusDisplay.textContent = displayError;
    } finally {
        withdrawButton.disabled = false;
    }
}

function parseContractError(error, defaultMessage, specificReason1 = null, specificReason2 = null) {
    console.log("Raw error object:", error);
    let message = defaultMessage;

    if (error.reason) { message = error.reason; }
    else if (error.error?.message) { message = error.error.message; }
    else if (error.data?.message) { message = error.data.message; }
    else if (error.message) { message = error.message; }

    message = message.replace("execution reverted: ", "").replace("VM Exception while processing transaction: reverted with reason string ", "").replace("Internal JSON-RPC error.", "").replace(/error=.*{(.*)}.*}, method=.*$/, "$1");
    message = message.replace(/\"message\":\"(.*?)\".*$/, "$1");
    message = message.replace(/^Error\([^)]*\)\s*/, '');
    message = message.replace(/^Panic\([^)]*\)\s*/, '');
    message = message.trim();

    if (specificReason1 && message.toLowerCase().includes(specificReason1.toLowerCase())) {
        return `Error: ${specificReason1}`;
    }
    if (specificReason2 && message.toLowerCase().includes(specificReason2.toLowerCase())) {
        return `Error: ${specificReason2}`;
    }
    if (error.code === 4001 || message.includes("User denied transaction signature")) {
        return "Transaction rejected in MetaMask.";
    }
    if (error.code === -32000 && message.includes("insufficient funds")) {
        return "Error: Insufficient funds for gas.";
    }

    return `Error: ${message || defaultMessage}`;
}

showConnectSection();