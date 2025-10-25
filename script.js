// --- 1. CONFIGURATION ---
// Replace with your deployed contract address
const contractAddress = "0x6C331DAb0353d0BF2f36F69F4a642dE5eC99a42A"; // Use your actual address

// Replace with your contract's ABI
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
]; // Make sure ABI is pasted correctly

// --- 2. GLOBAL VARIABLES ---
let provider;
let signer;
let contract;

// --- 3. DOM ELEMENTS ---
// General Elements
const connectButton = document.getElementById('connectButton');
const walletAddressDisplay = document.getElementById('walletAddress');
const loadReportsButton = document.getElementById('loadReportsButton');
const reportList = document.getElementById('reportList');

// Elements for Submitting Reports
const cidInput = document.getElementById('cidInput');
const submitReportButton = document.getElementById('submitReportButton');
const submitStatusDisplay = document.getElementById('submitStatus');

// Elements for Owner Actions
const withdrawButton = document.getElementById('withdrawButton');
const withdrawStatusDisplay = document.getElementById('withdrawStatus');

// --- 4. EVENT LISTENERS ---
connectButton.addEventListener('click', connectWallet);
loadReportsButton.addEventListener('click', loadReports);
submitReportButton.addEventListener('click', submitReport);
withdrawButton.addEventListener('click', withdrawSlashedFunds); // Listener for owner withdraw

// --- 5. FUNCTIONS ---

// Function to connect MetaMask
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            console.log("Account:", address);

            walletAddressDisplay.textContent = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            connectButton.textContent = 'Wallet Connected';
            connectButton.disabled = true;

            contract = new ethers.Contract(contractAddress, contractABI, signer);
            loadReportsButton.disabled = false;

        } catch (error) {
            console.error("User denied account access or error occurred:", error);
            walletAddressDisplay.textContent = 'Connection failed.';
        }
    } else {
        console.log('MetaMask is not installed!');
        walletAddressDisplay.textContent = 'Please install MetaMask!';
    }
}

// Function to load and display reports (with integrated buttons)
async function loadReports() {
    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    reportList.innerHTML = '<li>Loading reports...</li>';

    try {
        const count = await contract.reportCount();
        console.log("Total reports:", count.toNumber());

        if (count.toNumber() === 0) {
            reportList.innerHTML = '<li>No reports submitted yet.</li>';
            return;
        }

        reportList.innerHTML = ''; // Clear loading message

        // Loop through each report ID and fetch details
        for (let i = 0; i < count.toNumber(); i++) {
            console.log("Fetching report ID:", i);
            const report = await contract.reports(i);
            // report is array: [cid, reporter, upvotes, downvotes, stakedAmount, isResolved]

            const listItem = document.createElement('li');
            listItem.setAttribute('data-report-id', i);

            // Create list item HTML with integrated buttons
            listItem.innerHTML = `
                <div>
                    <b>Report ID: ${i}</b> | Resolved: ${report.isResolved ? '✅ Yes' : '❌ No'}<br>
                    CID: ${report.cid}<br>
                    Reporter: ${report.reporter.substring(0, 6)}...${report.reporter.substring(report.reporter.length - 4)}<br>
                    Votes: 👍 ${report.upvotes.toString()} / 👎 ${report.downvotes.toString()}
                </div>
                <div class="actions">
                    <button class="upvote-btn" data-id="${i}" ${report.isResolved ? 'disabled' : ''}>Upvote 👍</button>
                    <button class="downvote-btn" data-id="${i}" ${report.isResolved ? 'disabled' : ''}>Downvote 👎</button>
                    <button class="resolve-btn" data-id="${i}" ${report.isResolved ? 'disabled' : ''}>Resolve</button>
                </div>
                <p class="status-msg" id="status-${i}"></p> <hr>
            `;

            // Add event listeners ONLY if buttons exist and are not disabled
            const upvoteBtn = listItem.querySelector('.upvote-btn');
            const downvoteBtn = listItem.querySelector('.downvote-btn');
            const resolveBtn = listItem.querySelector('.resolve-btn');

            if (upvoteBtn && !report.isResolved) {
                upvoteBtn.addEventListener('click', () => handleVote(i, true, listItem));
            }
            if (downvoteBtn && !report.isResolved) {
                downvoteBtn.addEventListener('click', () => handleVote(i, false, listItem));
            }
            if (resolveBtn && !report.isResolved) {
                resolveBtn.addEventListener('click', () => resolveReport(i, listItem));
            }

            reportList.appendChild(listItem);
        } // End of for loop

    } catch (error) {
        console.error("Error loading reports:", error);
        reportList.innerHTML = '<li>Error loading reports. Check console.</li>';
    }
}

// Function to submit a new report
async function submitReport() {
    if (!contract || !signer) {
        alert("Please connect your wallet first.");
        return;
    }
    const cid = cidInput.value;
    if (!cid) {
        alert("Please enter a CID or URL to report.");
        return;
    }
    submitStatusDisplay.textContent = 'Preparing transaction...';
    submitReportButton.disabled = true;

    try {
        const stakeAmountWei = await contract.stakeAmount();
        console.log("Staking amount in wei:", stakeAmountWei.toString());
        console.log("Submitting report for CID:", cid);

        const tx = await contract.createReport(cid, { value: stakeAmountWei });
        submitStatusDisplay.textContent = `Transaction sent! Waiting... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Transaction sent:", tx.hash);

        await tx.wait();
        submitStatusDisplay.textContent = 'Report submitted successfully!';
        console.log("Transaction confirmed!");
        cidInput.value = '';
        await loadReports(); // Refresh list

    } catch (error) {
        console.error("Error submitting report:", error);
        let displayError = parseContractError(error, "Error submitting report.");
        submitStatusDisplay.textContent = displayError;
    } finally {
        submitReportButton.disabled = false;
    }
}

// Function to handle voting (updated for integrated buttons)
async function handleVote(reportIdNum, isUpvote, listItem) {
    if (!contract || !signer) {
        alert("Please connect your wallet first.");
        return;
    }

    const statusElement = listItem.querySelector('.status-msg');
    const upvoteBtn = listItem.querySelector('.upvote-btn');
    const downvoteBtn = listItem.querySelector('.downvote-btn');

    statusElement.textContent = `Preparing ${isUpvote ? 'upvote' : 'downvote'}...`;
    if (upvoteBtn) upvoteBtn.disabled = true; // Disable buttons on this specific item
    if (downvoteBtn) downvoteBtn.disabled = true;

    try {
        console.log(`Voting ${isUpvote ? 'up' : 'down'} on report ID:`, reportIdNum);
        const tx = await contract.vote(reportIdNum, isUpvote);
        statusElement.textContent = `Vote sent! Waiting... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Vote transaction sent:", tx.hash);

        await tx.wait();
        statusElement.textContent = 'Vote confirmed!';
        console.log("Vote confirmed!");
        await loadReports(); // Refresh list

    } catch (error) {
        console.error("Error submitting vote:", error);
        let displayError = parseContractError(error, "Error submitting vote.", "You have already voted!");
        statusElement.textContent = displayError;
    } finally {
        // Re-enable buttons only if the report isn't resolved now
        if (upvoteBtn && !listItem.innerHTML.includes('Resolved: ✅ Yes')) upvoteBtn.disabled = false;
        if (downvoteBtn && !listItem.innerHTML.includes('Resolved: ✅ Yes')) downvoteBtn.disabled = false;
    }
}

// Function to resolve a report (updated for integrated buttons)
async function resolveReport(reportIdNum, listItem) {
    if (!contract || !signer) {
        alert("Please connect your wallet first.");
        return;
    }

    const statusElement = listItem.querySelector('.status-msg');
    const resolveBtn = listItem.querySelector('.resolve-btn');

    statusElement.textContent = 'Preparing resolve transaction...';
    if (resolveBtn) resolveBtn.disabled = true;

    try {
        console.log("Resolving report ID:", reportIdNum);
        const tx = await contract.resolveReport(reportIdNum);
        statusElement.textContent = `Resolve sent! Waiting... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Resolve transaction sent:", tx.hash);

        await tx.wait();
        statusElement.textContent = 'Report resolved successfully!';
        console.log("Resolve confirmed!");
        await loadReports(); // Refresh list

    } catch (error) {
        console.error("Error resolving report:", error);
        let displayError = parseContractError(error, "Error resolving report.", "Not enough votes", "Report already resolved");
        statusElement.textContent = displayError;
        // Keep button disabled if successful (as report is now resolved)
        // Only re-enable if there was an error *other* than 'already resolved'
        if (resolveBtn && !displayError.includes("already resolved")) resolveBtn.disabled = false;
    }
    // No finally needed here as button state depends on error type or success
}


// Function for owner to withdraw slashed funds
async function withdrawSlashedFunds() {
    if (!contract || !signer) {
        alert("Please connect your wallet first.");
        return;
    }
    try { // Check owner status first
        const ownerAddress = await contract.owner();
        const currentUserAddress = await signer.getAddress();
        if (ownerAddress.toLowerCase() !== currentUserAddress.toLowerCase()) {
            withdrawStatusDisplay.textContent = "Error: Only the contract owner can withdraw.";
            return;
        }
    } catch (error) {
        console.error("Error checking owner:", error);
        withdrawStatusDisplay.textContent = "Error checking owner status.";
        return;
    }

    withdrawStatusDisplay.textContent = 'Preparing withdraw transaction...';
    withdrawButton.disabled = true;

    try {
        console.log("Attempting to withdraw slashed funds...");
        const tx = await contract.withdrawSlashedFunds();
        withdrawStatusDisplay.textContent = `Withdraw sent! Waiting... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Withdraw transaction sent:", tx.hash);

        await tx.wait();
        withdrawStatusDisplay.textContent = 'Slashed funds withdrawn successfully!';
        console.log("Withdraw confirmed!");

    } catch (error) {
        console.error("Error withdrawing funds:", error);
        let displayError = parseContractError(error, "Error withdrawing funds.");
        withdrawStatusDisplay.textContent = displayError;
    } finally {
        withdrawButton.disabled = false;
    }
}

// --- UTILITY FUNCTION ---
// Helper to parse common contract error reasons
function parseContractError(error, defaultMessage, specificReason1 = null, specificReason2 = null) {
    console.log("Raw error:", error); // Log the full error object
    let message = defaultMessage;
    // Ethers v5 structure
    if (error.reason) {
        message = `Error: ${error.reason}`;
    } else if (error.data && error.data.message) {
        message = `Error: ${error.data.message}`;
    } else if (error.error && error.error.message) { // Another possible structure
        message = `Error: ${error.error.message}`;
    } else if (error.message) {
        message = error.message; // Fallback to general message
    }

    // Clean up common prefixes/suffixes
    message = message.replace("execution reverted: ", "");
    message = message.replace("VM Exception while processing transaction: reverted with reason string ", "");
    message = message.replace("Error: ", ""); // Avoid double "Error:"

    // Check for specific known reasons from require statements
    if (specificReason1 && message.includes(specificReason1)) {
        return `Error: ${specificReason1}`;
    }
    if (specificReason2 && message.includes(specificReason2)) {
        return `Error: ${specificReason2}`;
    }
    // Check for user rejection
    if (message.includes("User denied transaction signature") || (error.code && error.code === 4001)) {
        return "Transaction rejected in MetaMask.";
    }

    // Return the cleaned or default message prefixed with Error:
    return `Error: ${message}`;
}


// --- INITIAL STATE ---
// Ensure buttons are disabled initially if wallet not connected
loadReportsButton.disabled = true;
// Initial calls to check connection can happen here if needed,
// but usually connecting on button press is fine.