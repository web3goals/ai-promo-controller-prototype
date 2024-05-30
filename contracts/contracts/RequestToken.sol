// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOracle.sol";

/**
 * @notice A contract that stores request tokens.
 */
contract RequestToken is ERC721URIStorage, Ownable {
    struct Content {
        address recipient;
        string task;
        uint paymentAmount;
        address paymentToken;
        uint createdDate;
        uint acceptDate;
        uint completeDate;
        string completeImageURI;
        bool completeSuccessful;
    }

    struct ChatRun {
        address owner;
        IOracle.Message[] messages;
        uint messagesCount;
    }

    event OracleAddressUpdated(address indexed newOracleAddress);
    event ChatCreated(address indexed owner, uint indexed runId);

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

    uint public nextTokenId;
    address public oracleAddress;
    IOracle.OpenAiRequest public oracleConfig;
    mapping(uint tokenId => Content content) public contents;
    mapping(address recipient => uint successes) public recipientSuccesses;
    mapping(address recipient => uint fails) public recipientFails;
    address[] public recipients;
    mapping(uint runId => uint tokenId) chatRunsTokens;
    mapping(uint => ChatRun) public chatRuns;
    uint public chatRunsCount;
    string promptPart1 = "I sent the next task to a influencer: '";
    string promptPart2 =
        "'. The influencer said he did the necessary post and sent me this image. Give me an answer that contains ONLY ONE word: 'success' if my task is completed successfully, 'fail' if my task is failed. Double-check that your answer contains only one word.";

    constructor(
        address initOracleAddress
    ) ERC721("Request Token", "RQT") Ownable(msg.sender) {
        oracleAddress = initOracleAddress;

        oracleConfig = IOracle.OpenAiRequest({
            model: "gpt-4-turbo",
            frequencyPenalty: 21, // > 20 for null
            logitBias: "", // empty str for null
            maxTokens: 1000, // 0 for null
            presencePenalty: 21, // > 20 for null
            responseFormat: '{"type":"text"}',
            seed: 0, // null
            stop: "", // null
            temperature: 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
            topP: 101, // Percentage 0-100, > 100 means null
            tools: "",
            toolChoice: "", // "none" or "auto"
            user: "" // null
        });
    }

    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function setPrompt(
        string memory newPromptPart1,
        string memory newPromptPart2
    ) public onlyOwner {
        promptPart1 = newPromptPart1;
        promptPart2 = newPromptPart2;
    }

    function becomeRecipient() public {
        _saveRecipient(msg.sender);
    }

    function create(
        address recipient,
        string memory task,
        uint paymentAmount,
        address paymentToken,
        string memory uri
    ) public {
        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        Content memory content;
        content.recipient = recipient;
        content.task = task;
        content.paymentAmount = paymentAmount;
        content.paymentToken = paymentToken;
        content.createdDate = block.timestamp;
        contents[tokenId] = content;
        _saveRecipient(recipient);
    }

    function accept(uint tokenId) public {
        // Checks
        require(contents[tokenId].recipient == msg.sender, "Not recipient");
        require(contents[tokenId].acceptDate == 0, "Already accepted");
        // Send tokens to contract
        require(
            IERC20(contents[tokenId].paymentToken).transferFrom(
                _ownerOf(tokenId),
                address(this),
                contents[tokenId].paymentAmount
            ),
            "Failed to transfer payment to contract"
        );
        // Update content
        contents[tokenId].acceptDate = block.timestamp;
    }

    function complete(uint tokenId, string memory completeImageURI) public {
        // Checks
        require(contents[tokenId].recipient == msg.sender, "Not recipient");
        require(contents[tokenId].acceptDate != 0, "Not accepted");
        require(contents[tokenId].completeDate == 0, "Already completed");
        // Update content
        contents[tokenId].completeImageURI = completeImageURI;
        // Complete without oracle
        if (oracleAddress == address(0)) {
            _complete(tokenId, true);
        }
        // Complete with oracle
        else {
            string memory prompt = string.concat(
                promptPart1,
                contents[tokenId].task
            );
            prompt = string.concat(prompt, promptPart2);
            uint runId = startChat(prompt, completeImageURI);
            chatRunsTokens[runId] = tokenId;
        }
    }

    function startChat(
        string memory message,
        string memory imageURI
    ) public returns (uint i) {
        ChatRun storage run = chatRuns[chatRunsCount];

        run.owner = msg.sender;
        IOracle.Message memory newMessage = IOracle.Message({
            role: "user",
            content: new IOracle.Content[](2)
        });
        newMessage.content[0] = IOracle.Content({
            contentType: "text",
            value: message
        });
        newMessage.content[1] = IOracle.Content({
            contentType: "image_url",
            value: imageURI
        });
        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = chatRunsCount;
        chatRunsCount = chatRunsCount + 1;

        IOracle(oracleAddress).createOpenAiLlmCall(currentId, oracleConfig);
        emit ChatCreated(msg.sender, currentId);

        return currentId;
    }

    function addMessage(string memory message, uint runId) public {
        ChatRun storage run = chatRuns[runId];
        require(
            keccak256(
                abi.encodePacked(run.messages[run.messagesCount - 1].role)
            ) == keccak256(abi.encodePacked("assistant")),
            "No response to previous message"
        );
        require(run.owner == msg.sender, "Only chat owner can add messages");

        IOracle.Message memory newMessage = IOracle.Message({
            role: "user",
            content: new IOracle.Content[](1)
        });
        newMessage.content[0].contentType = "text";
        newMessage.content[0].value = message;
        run.messages.push(newMessage);
        run.messagesCount++;

        IOracle(oracleAddress).createOpenAiLlmCall(runId, oracleConfig);
    }

    function getRecipients() public view returns (address[] memory) {
        return recipients;
    }

    function getMessageHistory(
        uint chatId
    ) public view returns (IOracle.Message[] memory) {
        return chatRuns[chatId].messages;
    }

    function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage
    ) public onlyOracle {
        ChatRun storage run = chatRuns[runId];
        require(
            keccak256(
                abi.encodePacked(run.messages[run.messagesCount - 1].role)
            ) == keccak256(abi.encodePacked("user")),
            "No message to respond to"
        );

        if (!_compareStrings(errorMessage, "")) {
            IOracle.Message memory newMessage = IOracle.Message({
                role: "assistant",
                content: new IOracle.Content[](1)
            });
            newMessage.content[0].contentType = "text";
            newMessage.content[0].value = errorMessage;
            run.messages.push(newMessage);
            run.messagesCount++;
        } else {
            IOracle.Message memory newMessage = IOracle.Message({
                role: "assistant",
                content: new IOracle.Content[](1)
            });
            newMessage.content[0].contentType = "text";
            newMessage.content[0].value = response.content;
            run.messages.push(newMessage);
            run.messagesCount++;
            // Complete token
            if (_compareStrings(response.content, "success")) {
                _complete(chatRunsTokens[runId], true);
            }
            if (_compareStrings(response.content, "fail")) {
                _complete(chatRunsTokens[runId], false);
            }
        }
    }

    function _saveRecipient(address recipient) private {
        for (uint i = 0; i < recipients.length; i++) {
            if (recipients[i] == recipient) {
                return;
            }
        }
        recipients.push(recipient);
    }

    function _complete(uint tokenId, bool completeSuccessful) private {
        contents[tokenId].completeDate = block.timestamp;
        contents[tokenId].completeSuccessful = completeSuccessful;
        if (completeSuccessful) {
            require(
                IERC20(contents[tokenId].paymentToken).transfer(
                    contents[tokenId].recipient,
                    contents[tokenId].paymentAmount
                ),
                "Failed to transfer payment to recipient"
            );
            recipientSuccesses[contents[tokenId].recipient]++;
        } else {
            require(
                IERC20(contents[tokenId].paymentToken).transfer(
                    _ownerOf(tokenId),
                    contents[tokenId].paymentAmount
                ),
                "Failed to transfer payment to owner"
            );
            recipientFails[contents[tokenId].recipient]++;
        }
    }

    function _compareStrings(
        string memory a,
        string memory b
    ) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }
}
