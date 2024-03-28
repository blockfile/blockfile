import React, { useState, useContext, useEffect, useRef } from "react";
import Navbar from "../../navbar/navbar";
import axios from "axios";
import Footer from "../../Footer/Footer";
import "./uploadpage.css";
import { FaFolderPlus } from "react-icons/fa";
import { FiFilePlus } from "react-icons/fi";
import TokenContext from "../../assets/TokenContext";
import { Link } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
    FaFilePdf,
    FaFileImage,
    FaFileAlt,
    FaFileVideo,
    FaFileAudio,
    FaFileCode,
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileArchive,
    FaFileCsv,
} from "react-icons/fa";

const fileTypeIcons = {
    pdf: <FaFilePdf />,
    jpg: <FaFileImage />,
    jpeg: <FaFileImage />,
    png: <FaFileImage />,
    gif: <FaFileImage />,
    svg: <FaFileImage />,
    bmp: <FaFileImage />,
    txt: <FaFileAlt />,
    doc: <FaFileWord />,
    docx: <FaFileWord />,
    xls: <FaFileExcel />,
    xlsx: <FaFileExcel />,
    ppt: <FaFilePowerpoint />,
    pptx: <FaFilePowerpoint />,
    mp4: <FaFileVideo />,
    mkv: <FaFileVideo />,
    flv: <FaFileVideo />,
    webm: <FaFileVideo />,
    avchd: <FaFileVideo />,
    whm: <FaFileVideo />,
    mov: <FaFileVideo />,
    avi: <FaFileVideo />,

    wmv: <FaFileVideo />,

    mp3: <FaFileAudio />,
    wav: <FaFileAudio />,
    aac: <FaFileAudio />,
    flac: <FaFileAudio />,
    html: <FaFileCode />,
    css: <FaFileCode />,
    js: <FaFileCode />,
    jsx: <FaFileCode />,
    ts: <FaFileCode />,
    tsx: <FaFileCode />,
    json: <FaFileCode />,
    xml: <FaFileCode />,
    csv: <FaFileCsv />,
    zip: <FaFileArchive />,
    rar: <FaFileArchive />,
    "7z": <FaFileArchive />,
    tar: <FaFileArchive />,
    gz: <FaFileArchive />,
    bz2: <FaFileArchive />,

    // Add or remove file types as needed
};

function UploadPage() {
    const [files, setFiles] = useState([]);
    const [account, setAccount] = useState("");
    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const contextMenuRef = useRef(null);
    const [contextMenuFileIds, setContextMenuFileIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const [totalUploadedSize, setTotalUploadedSize] = useState(0);
    const [uploadQueue, setUploadQueue] = useState([]);
    const { tokenBalance } = useContext(TokenContext);
    const [maxUploadSize, setMaxUploadSize] = useState(5 * 1024 * 1024 * 1024); // Default to 5GB
    const [windowSize, setWindowSize] = useState(window.innerWidth);
    const isWalletConnected = account && window.ethereum;
    const [tabValue, setTabValue] = useState(0); // New state for tab management
    const [ipfsFiles, setIpfsFiles] = useState([]);
    const [ipfsUploadTrigger, setIpfsUploadTrigger] = useState(false);
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Render IPFS files in the IPFS tab
    useEffect(() => {
        // This effect depends on `account` and `ipfsUploadTrigger`, ensuring it runs after uploads
        fetchIpfsFiles();
    }, [account, ipfsUploadTrigger]);

    const fetchIpfsFiles = async () => {
        if (!account) return;
        try {
            const response = await axios.get(
                `https://dapp.blockfile.xyz/api/ipfsFiles?walletAddress=${account}`
            );
            setIpfsFiles(response.data);
            console.log("IPFS Files fetched: ", response.data); // Debugging
        } catch (error) {
            console.error("Error fetching IPFS files:", error);
        }
    };

    useEffect(() => {
        console.log("Updated tokenBalance: ", tokenBalance); // For debugging
        let newSize;
        if (tokenBalance >= 1500001 && tokenBalance <= 2000000) {
            newSize = 10 * 1024 * 1024 * 1024; // 10GB
        } else if (tokenBalance >= 1000001 && tokenBalance <= 1500000) {
            newSize = 5 * 1024 * 1024 * 1024; // 5GB
        } else if (tokenBalance >= 500001 && tokenBalance <= 1000000) {
            newSize = 1024 * 1024 * 1024; // 1GB
        } else if (tokenBalance >= 100001 && tokenBalance <= 500000) {
            newSize = 500 * 1024 * 1024; // 500MB
        } else if (tokenBalance >= 10001 && tokenBalance <= 100000) {
            newSize = 100 * 1024 * 1024; // 100MB
        } else if (tokenBalance >= 1 && tokenBalance <= 10000) {
            newSize = 10 * 1024 * 1024; // 10MB
        } else {
            newSize = 5 * 1024 * 1024; // Default to 5MB for 0 or negative token balances
        }
        setMaxUploadSize(newSize);
    }, [tokenBalance]);

    console.log(tokenBalance);
    useEffect(() => {
        const fetchWalletAddress = async () => {
            const accounts = await window.ethereum?.request({
                method: "eth_accounts",
            });
            if (accounts?.length > 0) {
                setAccount(accounts[0]);
            }
        };

        fetchWalletAddress();
    }, []);

    const fetchFiles = async () => {
        if (account) {
            try {
                const response = await axios.get(
                    `https://dapp.blockfile.xyz/api/files?walletAddress=${account}`
                );
                console.log(response.data); // Log to see the data structure
                setFiles(response.data);
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        }
    };

    useEffect(() => {
        fetchFiles(); // Existing call to fetch digital space files
    }, [account]); // Dependency on account state

    useEffect(() => {
        fetchIpfsFiles(); // Fetch IPFS files
    }, [account]); // Dependency on account state

    useEffect(() => {
        const handleRightClick = (event) => {
            event.preventDefault();
        };

        document.addEventListener("contextmenu", handleRightClick);
        return () => {
            document.removeEventListener("contextmenu", handleRightClick);
        };
    }, []);

    const fetchTotalUploadedSize = async () => {
        if (account) {
            try {
                const response = await axios.get(
                    `https://dapp.blockfile.xyz/api/totalSize?walletAddress=${account}`
                );
                const { totalSize } = response.data;
                setTotalUploadedSize(totalSize);
            } catch (error) {
                console.error("Error fetching total uploaded size:", error);
                setTotalUploadedSize(0); // Reset to 0 in case of error
            }
        }
    };
    useEffect(() => {
        fetchTotalUploadedSize();
    }, [account]);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const newQueue = selectedFiles.map((file) => {
            const { token, cancel } = axios.CancelToken.source();
            return {
                file,
                progress: 0,
                status: "queued",
                cancelToken: token, // Add the token here
                cancel, // Add the cancel function here
            };
        });
        setUploadQueue((prevQueue) => [...prevQueue, ...newQueue]);
    };

    const updateFileProgress = (index, progress) => {
        setUploadQueue((currentQueue) =>
            currentQueue.map((file, i) =>
                i === index ? { ...file, progress } : file
            )
        );
    };
    const updateTotalUploadedSize = () => {
        const totalSize = uploadQueue.reduce((acc, file) => {
            return acc + (file.status === "done" ? file.file.size : 0);
        }, 0);
        setTotalUploadedSize(totalSize);
    };
    const updateFileStatus = (index, status) => {
        setUploadQueue((currentQueue) =>
            currentQueue.map((file, i) =>
                i === index ? { ...file, status } : file
            )
        );
        // Add this line to update the total uploaded size whenever a file's status is updated
        updateTotalUploadedSize();
    };

    const toggleFileSelection = (fileId) => {
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(fileId)) {
            newSelection.delete(fileId);
        } else {
            newSelection.add(fileId);
        }
        setSelectedFiles(newSelection);
    };

    const handleUpload = async () => {
        let allUploadsCompleted = true;

        // Calculate the size of files being uploaded
        const filesToUploadSize = uploadQueue.reduce(
            (acc, fileData) => acc + fileData.file.size,
            0
        );

        // Check if adding these files would exceed the max upload size
        if (totalUploadedSize + filesToUploadSize > maxUploadSize) {
            alert("You have exceeded your allocated upload space.");
            return; // Stop the upload process
        }

        for (let i = 0; i < uploadQueue.length; i++) {
            const fileData = uploadQueue[i];
            if (fileData.status === "queued") {
                updateFileStatus(i, "uploading");

                const formData = new FormData();
                formData.append("file", fileData.file);
                formData.append("walletAddress", account);

                try {
                    await axios.post(
                        "https://dapp.blockfile.xyz/api/upload",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                            onUploadProgress: (progressEvent) => {
                                const percentCompleted = Math.round(
                                    (progressEvent.loaded * 100) /
                                        progressEvent.total
                                );
                                updateFileProgress(i, percentCompleted);
                            },
                            cancelToken: fileData.cancelToken,
                        }
                    );

                    updateFileStatus(i, "done");
                    setTotalUploadedSize(
                        (prevSize) => prevSize + fileData.file.size
                    );
                } catch (error) {
                    if (axios.isCancel(error)) {
                        console.log("Upload canceled", error.message);
                        updateFileStatus(i, "cancelled");
                    } else {
                        console.error("Error uploading file:", error);
                        updateFileStatus(i, "error");
                    }
                    allUploadsCompleted = false;
                }
            }
        }

        const allFilesProcessed = () =>
            uploadQueue.every((file) =>
                ["done", "error", "cancelled"].includes(file.status)
            );

        const checkUploadCompletion = setInterval(() => {
            if (allFilesProcessed()) {
                clearInterval(checkUploadCompletion);
                if (allUploadsCompleted) {
                    alert("All files have been uploaded successfully!");

                    fetchFiles();
                } else {
                    alert("Some files were not uploaded successfully.");
                }
            }
        }, 500);
    };

    const handleContextMenu = (event, fileId) => {
        event.preventDefault();
        if (selectedFiles.has(fileId) || selectedFiles.size > 0) {
            const selectedFileIds =
                selectedFiles.size > 1 ? [...selectedFiles] : [fileId];
            setContextMenuFileIds(selectedFileIds); // Update to use the new state

            const menu = contextMenuRef.current;
            menu.style.top = `${event.clientY}px`;
            menu.style.left = `${event.clientX}px`;
            menu.style.display = "block";
        }
    };

    const hideContextMenu = () => {
        const menu = contextMenuRef.current;
        if (menu) {
            menu.style.display = "none";
        }
    };

    useEffect(() => {
        // Check if all files in the queue have a status of 'done', 'error', or 'cancelled'
        const allUploadsCompleted = uploadQueue.every((file) =>
            ["done", "error", "cancelled"].includes(file.status)
        );

        if (allUploadsCompleted && uploadQueue.length > 0) {
            fetchFiles(); // Refresh the file list
            fetchTotalUploadedSize(); // Update the total uploaded size
        }
    }, [uploadQueue]);
    const removeFileFromQueue = (indexToRemove) => {
        const fileData = uploadQueue[indexToRemove];

        if (fileData.status === "uploading") {
            const confirmCancel = window.confirm(
                "Do you want to cancel uploading?"
            );
            if (confirmCancel) {
                fileData.cancel("Upload cancelled by the user."); // Cancel the upload
                setUploadQueue((currentQueue) =>
                    currentQueue.filter((_, index) => index !== indexToRemove)
                );
            }
        } else {
            setUploadQueue((currentQueue) =>
                currentQueue.filter((_, index) => index !== indexToRemove)
            );
        }
    };

    const deleteFiles = async () => {
        if (selectedFiles.size === 0) {
            alert("Please select one or more files to delete.");
            return;
        }

        const fileIds = Array.from(selectedFiles);

        if (tabValue === 0) {
            // Digital Space tab
            try {
                const response = await axios.post(
                    "https://dapp.blockfile.xyz/api/delete-multiple",
                    { fileIds },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.data.success) {
                    setFiles((prevFiles) =>
                        prevFiles.filter((file) => !selectedFiles.has(file._id))
                    );
                    await fetchTotalUploadedSize();
                    alert("Selected files deleted successfully!");
                } else {
                    alert("Failed to delete selected files.");
                }
            } catch (error) {
                console.error("Error deleting selected files:", error);
                alert("Error deleting selected files.");
            }
        } else if (tabValue === 1) {
            // IPFS tab
            await deleteIpfsFiles(fileIds);
        }

        setSelectedFiles(new Set()); // Clear selection after deletion
        hideContextMenu();
    };

    // Ensure you define the deleteIpfsFile function as shown previously
    const deleteIpfsFiles = async (fileIds) => {
        try {
            const response = await axios.post(
                "https://dapp.blockfile.xyz/api/deleteMultipleIpfsFiles",
                { fileIds }
            );
            if (response.status === 200) {
                alert("Selected files deleted successfully");
                // Optionally, handle the response to check individual deletion results
                // For example, log failures or provide detailed user feedback
                console.log("Deletion results:", response.data);

                // Refresh your frontend file list as needed
                fetchIpfsFiles();
            } else {
                throw new Error("Failed to delete files");
            }
        } catch (error) {
            console.error("Error deleting files:", error);
            alert("Error deleting files");
        }
    };

    const moveFile = (fileId) => {
        // Placeholder logic for moving a file
        console.log("Move File", fileId);
        hideContextMenu();
        // You might display a modal for the user to select a new folder or similar
    };

    const copyLink = (fileId) => {
        let fileUrl;

        // Check if the fileId is in the Digital Space files
        const digitalSpaceFile = files.find((f) => f._id === fileId);
        if (digitalSpaceFile) {
            // Use the existing method to construct the download URL
            fileUrl = `https://dapp.blockfile.xyz/download/${fileId}`;
        } else {
            // Since it's not a Digital Space file, check the IPFS files
            const ipfsFile = ipfsFiles.find((f) => f._id === fileId);
            if (ipfsFile) {
                // Use the direct link from the file's metadata
                fileUrl = ipfsFile.link;
            }
        }

        if (fileUrl) {
            // Copy the fileUrl to the clipboard
            navigator.clipboard
                .writeText(fileUrl)
                .then(() => alert("Link copied to clipboard!"))
                .catch((err) => alert("Failed to copy link. Error: " + err));
        } else {
            alert("File not found.");
        }
    };

    useEffect(() => {
        const handleGlobalClick = (e) => {
            if (
                contextMenuRef.current &&
                !contextMenuRef.current.contains(e.target)
            ) {
                hideContextMenu();
            }
        };

        document.addEventListener("click", handleGlobalClick);
        return () => document.removeEventListener("click", handleGlobalClick);
    }, []);

    const closeModal = () => {
        // Check if all files are done uploading
        const allDone = uploadQueue.every((file) => file.status === "done");
        setIsModalOpen(false);
        fetchFiles(); // Fetch latest files list
        setUploadQueue([]);
        let shouldCloseModal = true; // Assume we can close the modal

        // If not all files are done uploading and there are files in the upload queue, ask the user for confirmation
        if (!allDone && uploadQueue.length > 0) {
            shouldCloseModal = window.confirm(
                "Do you want to clear your selection?"
            );
        }

        if (shouldCloseModal) {
            setIsModalOpen(false); // Close the modal
            setUploadQueue([]); // Clear the upload queue
        }
        // If the user cancels and there are files in the queue, the modal remains open
    };

    const handleUploadButtonClick = () => {
        // Toggle the state to show/hide the modal
        setIsModalOpen(!isModalOpen);
    };
    const handleIconClick = () => {
        // When the icon is clicked, trigger a click on the file input
        fileInputRef.current.click();
    };

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " Bytes";
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        else if (bytes < 1024 * 1024 * 1024)
            return (bytes / 1024 / 1024).toFixed(2) + " MB";
        else return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
    }
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // If checking the box, select all files
            const allFileIds = new Set(
                (tabValue === 0 ? files : ipfsFiles).map((file) => file._id)
            );
            setSelectedFiles(allFileIds);
        } else {
            // If unchecking the box, clear the selection
            setSelectedFiles(new Set());
        }
    };

    const uploadPercentage = Math.min(
        100,
        (totalUploadedSize / maxUploadSize) * 100
    ).toFixed(2);

    const iconSize = windowSize >= 768 ? 200 : 50;
    useEffect(() => {
        function handleResize() {
            setWindowSize(window.innerWidth);
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleUploadToIPFS = async () => {
        let allUploadsCompleted = true;

        // Iterate through each file in the uploadQueue
        for (let i = 0; i < uploadQueue.length; i++) {
            const fileData = uploadQueue[i];

            // Check if file size exceeds 30MB
            if (fileData.file.size > 30 * 1024 * 1024) {
                alert(
                    `File ${fileData.file.name} exceeds the 30MB size limit and will not be uploaded.`
                );
                updateFileStatus(i, "error"); // Marking it as error to indicate skipping
                continue; // Skip this file
            }

            // Only proceed if the file is queued for upload
            if (fileData.status === "queued") {
                updateFileStatus(i, "uploading");

                const formData = new FormData();
                formData.append("file", fileData.file);
                formData.append("walletAddress", account); // Include the wallet address

                try {
                    const response = await axios.post(
                        "https://dapp.blockfile.xyz/api/uploadToIPFS", // Ensure URL is correct
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                            onUploadProgress: (progressEvent) => {
                                const percentCompleted = Math.round(
                                    (progressEvent.loaded * 100) /
                                        progressEvent.total
                                );
                                updateFileProgress(i, percentCompleted);
                            },
                            cancelToken: fileData.cancelToken, // Handle cancellation if needed
                        }
                    );

                    console.log("File uploaded to IPFS:", response.data);
                    updateFileStatus(i, "done");
                    setIpfsUploadTrigger(!ipfsUploadTrigger);
                    fetchIpfsFiles();
                } catch (error) {
                    console.error("Error uploading to IPFS:", error);
                    updateFileStatus(i, "error");
                    allUploadsCompleted = false;
                }
            }
        }

        // Additional checks or updates after the upload process
        if (
            uploadQueue.every((file) => ["done", "error"].includes(file.status))
        ) {
            if (allUploadsCompleted) {
                alert(
                    "All applicable files have been uploaded to IPFS successfully!"
                );
            } else {
                alert("Some files were not uploaded to IPFS successfully.");
            }
            fetchIpfsFiles(); // Refresh IPFS files list
            setIpfsUploadTrigger(!ipfsUploadTrigger);
        }
    };

    return (
        <div className="bg-gray-900 text-white h-screen font-anta bg">
            <Navbar />
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                }}
                className="font-anta">
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    centered
                    sx={{
                        "& .MuiTab-root": {
                            color: "white",
                        },
                        "& .Mui-selected": {
                            color: "cyan",
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "white",
                        },
                    }}>
                    <Tab label="Digital Space" />
                    <Tab label="IPFS" />
                </Tabs>
            </Box>
            <div className="flex">
                <div className="w-full pt-4 pl-4 pr-4">
                    {tabValue === 0 && (
                        <>
                            <div className="md:flex justify-between mx-6 my-2">
                                <div>
                                    <span className="text-lg font-semibold mb-4">
                                        My Files
                                    </span>
                                </div>
                                <div className="md:flex sm:space-y-4 space-x-4">
                                    <div className="">
                                        <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{
                                                    width: `${uploadPercentage}%`,
                                                }}></div>
                                        </div>
                                        <div className="text-sm sm:text-center md:text-right mt-1">
                                            {uploadPercentage}% (
                                            {(
                                                totalUploadedSize /
                                                (1024 * 1024)
                                            ).toFixed(2)}{" "}
                                            MB /{" "}
                                            {(
                                                maxUploadSize /
                                                (1024 * 1024)
                                            ).toFixed(2)}{" "}
                                            MB)
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={handleUploadButtonClick}
                                            className={`${
                                                isWalletConnected
                                                    ? "bg-blue-500 hover:bg-blue-700"
                                                    : "bg-gray-500 cursor-not-allowed"
                                            } text-white font-bold py-2 px-4 rounded`}
                                            disabled={!isWalletConnected}>
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex mx-6 my-2 space-x-4">
                                <div>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                            files.length > 0 &&
                                            selectedFiles.size === files.length
                                        }
                                    />
                                    <span> SELECT ALL FILES</span>
                                </div>
                            </div>
                            {files.length === 0 ? (
                                <div className="text-center">
                                    {isWalletConnected
                                        ? "This folder is empty"
                                        : "Please connect your MetaMask wallet first."}
                                </div>
                            ) : (
                                <div className="files-table-container md:max-h-[750px] overflow-y-auto sm:max-h-[600px]">
                                    <table className="min-w-full">
                                        <tbody>
                                            {Array.isArray(files) &&
                                                files.map((file, idx) => (
                                                    <tr
                                                        key={file._id}
                                                        className={`border-b hover:bg-slate-700 border-gray-700 ${
                                                            selectedFiles.has(
                                                                file._id
                                                            )
                                                                ? "bg-blue-500"
                                                                : "bg-transparent"
                                                        }`}
                                                        onClick={() =>
                                                            toggleFileSelection(
                                                                file._id
                                                            )
                                                        }
                                                        onContextMenu={(e) =>
                                                            handleContextMenu(
                                                                e,
                                                                file._id
                                                            )
                                                        }>
                                                        <td className="px-6 text-sm font-medium text-left">
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedFiles.has(
                                                                        file._id
                                                                    )}
                                                                    onChange={() =>
                                                                        toggleFileSelection(
                                                                            file._id
                                                                        )
                                                                    }
                                                                    className="form-checkbox text-blue-600"
                                                                />
                                                                {(() => {
                                                                    const fileExtension =
                                                                        file.filename
                                                                            .split(
                                                                                "."
                                                                            )
                                                                            .pop()
                                                                            .toLowerCase();
                                                                    const IconComponent =
                                                                        fileTypeIcons[
                                                                            fileExtension
                                                                        ] || (
                                                                            <FaFileAlt />
                                                                        );
                                                                    return (
                                                                        <>
                                                                            {
                                                                                IconComponent
                                                                            }
                                                                        </>
                                                                    );
                                                                })()}
                                                                <div>
                                                                    <span className="hidden sm:block truncate max-w-xs">
                                                                        {
                                                                            file.filename
                                                                        }
                                                                    </span>
                                                                    <span className="block sm:hidden truncate max-w-xs">
                                                                        {file
                                                                            .filename
                                                                            .length >
                                                                        6
                                                                            ? `${file.filename.substring(
                                                                                  0,
                                                                                  6
                                                                              )}…`
                                                                            : file.filename}
                                                                    </span>
                                                                    <span className="file-size text-xs text-gray-400">
                                                                        {formatFileSize(
                                                                            file.size
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-xs text-gray-500">
                                                            {new Date(
                                                                file.createdAt
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                    {tabValue === 1 && (
                        <>
                            <div className="md:flex justify-between mx-6 my-2">
                                <div>
                                    <span className="text-lg font-semibold mb-4">
                                        My IPFS Files
                                    </span>
                                </div>
                                <div>
                                    <button
                                        onClick={handleUploadButtonClick}
                                        className={`${
                                            isWalletConnected
                                                ? "bg-blue-500 hover:bg-blue-700"
                                                : "bg-gray-500 cursor-not-allowed"
                                        } text-white font-bold py-2 px-4 rounded`}
                                        disabled={!isWalletConnected}>
                                        Upload
                                    </button>
                                </div>
                            </div>
                            <div className="flex mx-6 my-2 space-x-4">
                                <div>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                            (tabValue === 0 ? files : ipfsFiles)
                                                .length > 0 &&
                                            selectedFiles.size ===
                                                (tabValue === 0
                                                    ? files
                                                    : ipfsFiles
                                                ).length
                                        }
                                    />
                                    <span> SELECT ALL FILES</span>
                                </div>
                            </div>
                            {ipfsFiles.length > 0 ? (
                                <div className="files-table-container md:max-h-[750px] overflow-y-auto sm:max-h-[600px]">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="text-left">
                                                <th className="px-6 py-3">
                                                    Filename
                                                </th>
                                                <th className="px-6 py-3">
                                                    FileHash
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(files) &&
                                                ipfsFiles.map((file, index) => (
                                                    <tr
                                                        key={file._id}
                                                        className={`border-b hover:bg-slate-700 border-gray-700 ${
                                                            selectedFiles.has(
                                                                file._id
                                                            )
                                                                ? "bg-blue-500"
                                                                : "bg-transparent"
                                                        }`}
                                                        onClick={() =>
                                                            toggleFileSelection(
                                                                file._id
                                                            )
                                                        }
                                                        onContextMenu={(e) =>
                                                            handleContextMenu(
                                                                e,
                                                                file._id
                                                            )
                                                        }>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedFiles.has(
                                                                        file._id
                                                                    )}
                                                                    onChange={() =>
                                                                        toggleFileSelection(
                                                                            file._id
                                                                        )
                                                                    }
                                                                    className="form-checkbox text-blue-600"
                                                                />
                                                                <span>
                                                                    {
                                                                        file.filename
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-left">
                                                            {file.IpfsHash}
                                                        </td>
                                                        <td className="px-6 ">
                                                            <div>
                                                                <span className=" text-xs">
                                                                    {new Date(
                                                                        file.createdAt
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                {" "}
                                                                <a
                                                                    href={
                                                                        file.link
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className=" text-xs">
                                                                    View on IPFS
                                                                </a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center">
                                    {isWalletConnected
                                        ? "No IPFS files found."
                                        : "Please connect your MetaMask wallet first."}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div
                ref={contextMenuRef}
                className="context-menu"
                onContextMenu={(e) => e.preventDefault()}>
                {contextMenuFileIds.length === 1 &&
                    tabValue === 0 && ( // Show download only for Digital Space files
                        <Link to={`/download/${contextMenuFileIds[0]}`}>
                            <button>Download</button>
                        </Link>
                    )}

                <button onClick={() => deleteFiles(contextMenuFileIds)}>
                    Delete
                </button>
                <button onClick={() => moveFile(contextMenuFileIds)}>
                    Move
                </button>
                {contextMenuFileIds.length === 1 && (
                    <button onClick={() => copyLink(contextMenuFileIds[0])}>
                        Copy Link
                    </button>
                )}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm   z-50 flex justify-center items-center ">
                    <div className=" bg-modal p-4 rounded-2xl shadow-lg ">
                        <div>
                            <button
                                onClick={closeModal}
                                className="flex justify-end text-5xl text-white">
                                &times;
                            </button>
                        </div>
                        <h3 className="text-lg font-bold">Upload Files</h3>
                        <div className=" overflow-y-auto max-h-[600px] files-table-container ">
                            {uploadQueue.length > 0 ? (
                                <div className="sm:mx-2 sm:my-2 md:mx-24 md:my-24">
                                    {uploadQueue.map((fileData, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between items-center space-x-2">
                                                <div className=" filename ">
                                                    {fileData.file.name}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeFileFromQueue(
                                                            index
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-700 mr-2">
                                                    X
                                                </button>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-700 my-2 relative">
                                                <div></div>
                                                <div
                                                    className="bg-blue-600 h-5 rounded-full text-white text-sm flex items-center justify-end"
                                                    style={{
                                                        width: `${fileData.progress}%`,
                                                    }}>
                                                    <div
                                                        className={`${
                                                            fileData.progress <
                                                            10
                                                                ? "hidden"
                                                                : "mx-auto my-auto"
                                                        }`}>
                                                        {fileData.progress}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center text-sm">
                                                {fileData.status ===
                                                    "uploading" &&
                                                    "Uploading..."}
                                                {fileData.status ===
                                                    "finalizing" &&
                                                    "Finalizing..."}
                                                {fileData.status === "done" &&
                                                    "Upload Complete!"}
                                                {fileData.status === "error" &&
                                                    "Error in upload."}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mx-auto border-2 border-dashed pl-5 my-5">
                                    <div
                                        className="md:mx-24 md:my-24 sm:mx-20 sm:my-20"
                                        onClick={handleIconClick}>
                                        <FaFolderPlus
                                            className="cursor-pointer mx-auto"
                                            size={iconSize}
                                        />

                                        <p className="text-center mt-2">
                                            Add Files
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex space-x-5 justify-center mb-5">
                                <div
                                    onClick={handleIconClick}
                                    className="cursor-pointer">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple // Allow multiple file selection
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                        <FiFilePlus size={24} />
                                        <span>Add Files</span>
                                    </div>
                                </div>
                            </div>
                            {tabValue === 0 && (
                                // Existing Digital Space UI...
                                <button
                                    onClick={handleUpload} // Rename your existing handleUpload for clarity
                                    className={`${
                                        isWalletConnected
                                            ? "bg-blue-500 hover:bg-blue-700"
                                            : "bg-gray-500 cursor-not-allowed"
                                    } text-white font-bold py-2 px-4 rounded`}
                                    disabled={!isWalletConnected}>
                                    Upload to Digital Space
                                </button>
                            )}
                            {tabValue === 1 && (
                                // IPFS Tab UI...
                                <button
                                    onClick={handleUploadToIPFS}
                                    className={`${
                                        isWalletConnected
                                            ? "bg-blue-500 hover:bg-blue-700"
                                            : "bg-gray-500 cursor-not-allowed"
                                    } text-white font-bold py-2 px-4 rounded`}
                                    disabled={!isWalletConnected}>
                                    Upload to IPFS
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default UploadPage;
