// --- 1. CONFIGURATION ---
// Replace with your deployed contract address
const contractAddress = "0x6C331DAb0353d0BF2f36F69F4a642dE5eC99a42A";

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
]; // Keep the square brackets []

// --- 2. GLOBAL VARIABLES ---
let provider;
let signer;
let contract;

// --- 3. DOM ELEMENTS ---
const connectButton = document.getElementById('connectButton');
const walletAddressDisplay = document.getElementById('walletAddress');
const loadReportsButton = document.getElementById('loadReportsButton');
const reportList = document.getElementById('reportList');

const cidInput = document.getElementById('cidInput');
const submitReportButton = document.getElementById('submitReportButton');
const submitStatusDisplay = document.getElementById('submitStatus');

const voteIdInput = document.getElementById('voteIdInput');
const upvoteButton = document.getElementById('upvoteButton');
const downvoteButton = document.getElementById('downvoteButton');
const voteStatusDisplay = document.getElementById('voteStatus');

const resolveIdInput = document.getElementById('resolveIdInput');
const resolveButton = document.getElementById('resolveButton');
const resolveStatusDisplay = document.getElementById('resolveStatus');

// --- 4. EVENT LISTENERS ---
connectButton.addEventListener('click', connectWallet);
loadReportsButton.addEventListener('click', loadReports);
submitReportButton.addEventListener('click', submitReport);
// Voting listeners
upvoteButton.addEventListener('click', () => handleVote(true)); // Pass true for upvote
downvoteButton.addEventListener('click', () => handleVote(false)); // Pass false for downvote
// Resolving listener
resolveButton.addEventListener('click', resolveReport);

// --- 5. FUNCTIONS ---

// Function to connect MetaMask
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        try {
            // Use Ethers.js provider
            provider = new ethers.providers.Web3Provider(window.ethereum);

            // Request account access
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            console.log("Account:", address);

            // Display connected address
            walletAddressDisplay.textContent = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            connectButton.textContent = 'Wallet Connected';
            connectButton.disabled = true;

            // Initialize contract instance
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Enable the load reports button
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

// Function to load and display reports
async function loadReports() {
    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    reportList.innerHTML = '<li>Loading reports...</li>'; // Clear list and show loading

    try {
        // Get the total number of reports
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
            // report is an array/struct: [cid, reporter, upvotes, downvotes, stakedAmount, isResolved]

            // Create a list item to display the report
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <b>Report ID: ${i}</b><br>
                CID: ${report.cid}<br>
                Reporter: ${report.reporter.substring(0, 6)}...${report.reporter.substring(report.reporter.length - 4)}<br>
                Upvotes: ${report.upvotes.toString()}<br>
                Downvotes: ${report.downvotes.toString()}<br>
                Resolved: ${report.isResolved}
                <hr>
            `; // Added a horizontal rule for separation
            reportList.appendChild(listItem);
        }

    } catch (error) {
        console.error("Error loading reports:", error);
        reportList.innerHTML = '<li>Error loading reports. Check console.</li>';
    }
}

// --- INITIAL STATE ---
loadReportsButton.disabled = true; // Disable load button until wallet is connected
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
    submitReportButton.disabled = true; // Disable button while processing

    try {
        // Get the required stake amount from the contract
        const stakeAmountWei = await contract.stakeAmount(); // This is a BigNumber in wei

        console.log("Staking amount in wei:", stakeAmountWei.toString());
        console.log("Submitting report for CID:", cid);

        // Send the transaction to createReport, including the stake value
        const tx = await contract.createReport(cid, {
            value: stakeAmountWei // Send the required stake
        });

        submitStatusDisplay.textContent = `Transaction sent! Waiting for confirmation... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Transaction sent:", tx.hash);

        // Wait for the transaction to be mined
        await tx.wait(); // Wait for 1 confirmation

        submitStatusDisplay.textContent = 'Report submitted successfully! Transaction confirmed.';
        console.log("Transaction confirmed!");
        cidInput.value = ''; // Clear the input field

        // Optional: Automatically reload the reports list
        await loadReports();

    } catch (error) {
        console.error("Error submitting report:", error);
        // Try to get a more specific error message if available
        let displayError = "Error submitting report.";
        if (error.reason) {
            displayError = `Error: ${error.reason}`;
        } else if (error.data && error.data.message) {
            displayError = `Error: ${error.data.message}`;
        } else if (error.message) {
            // Shorten common MetaMask errors
            if (error.message.includes("User denied transaction signature")) {
                displayError = "Transaction rejected in MetaMask.";
            } else {
                displayError = "An error occurred. Check console.";
            }
        }
        submitStatusDisplay.textContent = displayError;
    } finally {
        // Re-enable the button whether it succeeded or failed
        submitReportButton.disabled = false;
    }
}

// Function to handle voting (both up and down)
async function handleVote(isUpvote) {
    if (!contract || !signer) {
        alert("Please connect your wallet first.");
        return;
    }

    const reportId = voteIdInput.value;
    if (reportId === "" || isNaN(reportId)) { // Check if input is empty or not a number
        alert("Please enter a valid Report ID to vote on.");
        return;
    }
    const reportIdNum = parseInt(reportId); // Convert string input to number

    voteStatusDisplay.textContent = `Preparing ${isUpvote ? 'upvote' : 'downvote'}...`;
    upvoteButton.disabled = true; // Disable buttons
    downvoteButton.disabled = true;

    try {
        console.log(`Voting ${isUpvote ? 'up' : 'down'} on report ID:`, reportIdNum);

        // Call the contract's vote function
        const tx = await contract.vote(reportIdNum, isUpvote);

        voteStatusDisplay.textContent = `Vote transaction sent! Waiting for confirmation... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Vote transaction sent:", tx.hash);

        await tx.wait(); // Wait for confirmation

        voteStatusDisplay.textContent = 'Vote submitted successfully! Transaction confirmed.';
        console.log("Vote confirmed!");
        voteIdInput.value = ''; // Clear the input

        // Refresh the report list to show updated votes
        await loadReports();

    } catch (error) {
        console.error("Error submitting vote:", error);
        let displayError = "Error submitting vote.";
        if (error.reason) { // Standard ethers error reason
            displayError = `Error: ${error.reason}`;
        } else if (error.data && error.data.message && error.data.message.includes("You have already voted!")) { // Specific check for our custom error
            displayError = "Error: You have already voted on this report!";
        } else if (error.data && error.data.message) { // Fallback for other RPC errors
            displayError = `Error: ${error.data.message}`;
        } else if (error.message && error.message.includes("User denied transaction signature")) {
            displayError = "Transaction rejected in MetaMask.";
        } else {
            displayError = "An error occurred. Check console.";
        }
        voteStatusDisplay.textContent = displayError;
    } finally {
        upvoteButton.disabled = false; // Re-enable buttons
        downvoteButton.disabled = false;
    }
}

// Function to resolve a report
async function resolveReport() {
    if (!contract || !signer) {
        alert("Please connect your wallet first.");
        return;
    }

    const reportId = resolveIdInput.value;
    if (reportId === "" || isNaN(reportId)) { // Check if input is empty or not a number
        alert("Please enter a valid Report ID to resolve.");
        return;
    }
    const reportIdNum = parseInt(reportId); // Convert string input to number

    resolveStatusDisplay.textContent = 'Preparing resolve transaction...';
    resolveButton.disabled = true;

    try {
        console.log("Resolving report ID:", reportIdNum);

        // Call the contract's resolveReport function
        const tx = await contract.resolveReport(reportIdNum);

        resolveStatusDisplay.textContent = `Resolve transaction sent! Waiting for confirmation... Hash: ${tx.hash.substring(0, 10)}...`;
        console.log("Resolve transaction sent:", tx.hash);

        await tx.wait(); // Wait for confirmation

        resolveStatusDisplay.textContent = 'Report resolved successfully! Transaction confirmed.';
        console.log("Resolve confirmed!");
        resolveIdInput.value = ''; // Clear the input

        // Refresh the report list to show resolved status
        await loadReports();

    } catch (error) {
        console.error("Error resolving report:", error);
        let displayError = "Error resolving report.";
        if (error.reason) { // Standard ethers error reason
            displayError = `Error: ${error.reason}`;
        } else if (error.data && error.data.message && error.data.message.includes("Not enough votes")) { // Specific check for threshold error
            displayError = "Error: Not enough votes to resolve yet.";
        } else if (error.data && error.data.message && error.data.message.includes("Report already resolved")) { // Specific check for already resolved error
            displayError = "Error: Report is already resolved.";
        } else if (error.data && error.data.message) { // Fallback for other RPC errors
            displayError = `Error: ${error.data.message}`;
        } else if (error.message && error.message.includes("User denied transaction signature")) {
            displayError = "Transaction rejected in MetaMask.";
        } else {
            displayError = "An error occurred. Check console.";
        }
        resolveStatusDisplay.textContent = displayError;
    } finally {
        resolveButton.disabled = false; // Re-enable button
    }
}