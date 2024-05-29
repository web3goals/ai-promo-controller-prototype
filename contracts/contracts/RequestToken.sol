// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

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

    event OracleAddressUpdated(address indexed newOracleAddress);

    uint public nextTokenId;
    address public oracleAddress;
    mapping(uint tokenId => Content content) public contents;
    mapping(address recipient => uint successes) public recipientSuccesses;
    mapping(address recipient => uint fails) public recipientFails;
    address[] public recipients;

    constructor(
        address initOracleAddress
    ) ERC721("Request Token", "RQT") Ownable(msg.sender) {
        oracleAddress = initOracleAddress;
    }

    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
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
        // Complete without oracle
        if (oracleAddress == address(0)) {
            contents[tokenId].completeDate = block.timestamp;
            contents[tokenId].completeImageURI = completeImageURI;
            contents[tokenId].completeSuccessful = true;
            require(
                IERC20(contents[tokenId].paymentToken).transfer(
                    contents[tokenId].recipient,
                    contents[tokenId].paymentAmount
                ),
                "Failed to transfer payment to recipient"
            );
            recipientSuccesses[contents[tokenId].recipient]++;
        }
        // Complete with oracle
        else {
            // TODO: Implement
        }
    }

    function getRecipients() public view returns (address[] memory) {
        return recipients;
    }

    function _saveRecipient(address recipient) private {
        for (uint i = 0; i < recipients.length; i++) {
            if (recipients[i] == recipient) {
                return;
            }
        }
        recipients.push(recipient);
    }
}
