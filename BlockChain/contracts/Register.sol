// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title Land Registry Smart Contract
/// @notice Manages property registration, ownership transfer, and record lookup on-chain.
/// @dev Deploy this contract on Remix IDE (remix.ethereum.org) and copy the deployed address
///      into frontend/src/blockchain/web3.js (the CONTRACT_ADDRESS constant).
contract LandRegistry {

    // ─── Data Structures ────────────────────────────────────────────────────────

    struct Property {
        string  propertyId;
        string  surveyNumber;
        string  location;
        uint256 area;          // in sq. ft.
        uint256 price;         // in wei (ETH * 1e18)
        address owner;
        bool    exists;
    }

    struct TransferRecord {
        address from;
        address to;
        uint256 price;         // in wei
        string  transferType;  // "sale", "gift", "inheritance"
        uint256 timestamp;
    }

    // ─── State Variables ─────────────────────────────────────────────────────────

    // propertyId => Property
    mapping(string => Property) public properties;

    // propertyId => list of all ownership transfers
    mapping(string => TransferRecord[]) public ownershipHistory;

    // ─── Events ──────────────────────────────────────────────────────────────────

    event PropertyRegistered(
        string  indexed propertyId,
        string  surveyNumber,
        string  location,
        uint256 area,
        uint256 price,
        address indexed owner
    );

    event PropertyTransferred(
        string  indexed propertyId,
        address indexed from,
        address indexed to,
        uint256 price,
        string  transferType,
        uint256 timestamp
    );

    // ─── Modifiers ───────────────────────────────────────────────────────────────

    modifier propertyExists(string memory _propertyId) {
        require(properties[_propertyId].exists, "Property not found");
        _;
    }

    modifier onlyOwner(string memory _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Not the property owner");
        _;
    }

    // ─── Functions ───────────────────────────────────────────────────────────────

    /// @notice Register a new property. Caller becomes the first owner.
    /// @param _propertyId   Unique property identifier (e.g. "PROP101")
    /// @param _surveyNumber Government survey number
    /// @param _location     Human-readable address/location
    /// @param _area         Area in sq. ft.
    /// @param _price        Asking price in wei (use web3.utils.toWei("2.5","ether") from frontend)
    function registerProperty(
        string memory _propertyId,
        string memory _surveyNumber,
        string memory _location,
        uint256 _area,
        uint256 _price
    ) public {
        require(!properties[_propertyId].exists, "Property already registered");
        require(bytes(_propertyId).length > 0,   "Property ID required");
        require(bytes(_surveyNumber).length > 0,  "Survey number required");
        require(bytes(_location).length > 0,      "Location required");
        require(_area > 0,                        "Area must be greater than zero");

        properties[_propertyId] = Property({
            propertyId:   _propertyId,
            surveyNumber: _surveyNumber,
            location:     _location,
            area:         _area,
            price:        _price,
            owner:        msg.sender,
            exists:       true
        });

        // Record initial registration as a transfer from zero address
        ownershipHistory[_propertyId].push(TransferRecord({
            from:         address(0),
            to:           msg.sender,
            price:        _price,
            transferType: "registration",
            timestamp:    block.timestamp
        }));

        emit PropertyRegistered(_propertyId, _surveyNumber, _location, _area, _price, msg.sender);
    }

    /// @notice Transfer ownership to a new address.
    /// @param _propertyId    The property to transfer
    /// @param _newOwner      New owner's Ethereum address
    /// @param _transferType  "sale", "gift", or "inheritance"
    /// @param _price         Sale price in wei (pass 0 for gift/inheritance)
    function transferProperty(
        string memory _propertyId,
        address _newOwner,
        string memory _transferType,
        uint256 _price
    ) public propertyExists(_propertyId) onlyOwner(_propertyId) {
        require(_newOwner != address(0),            "Invalid new owner address");
        require(_newOwner != msg.sender,            "Cannot transfer to yourself");
        require(bytes(_transferType).length > 0,    "Transfer type required");

        address previousOwner = properties[_propertyId].owner;

        // Update owner and optionally price
        properties[_propertyId].owner = _newOwner;
        if (_price > 0) {
            properties[_propertyId].price = _price;
        }

        ownershipHistory[_propertyId].push(TransferRecord({
            from:         previousOwner,
            to:           _newOwner,
            price:        _price,
            transferType: _transferType,
            timestamp:    block.timestamp
        }));

        emit PropertyTransferred(_propertyId, previousOwner, _newOwner, _price, _transferType, block.timestamp);
    }

    /// @notice Get property details.
    function getProperty(string memory _propertyId)
        public
        view
        propertyExists(_propertyId)
        returns (
            string memory surveyNumber,
            string memory location,
            uint256 area,
            uint256 price,
            address owner
        )
    {
        Property memory p = properties[_propertyId];
        return (p.surveyNumber, p.location, p.area, p.price, p.owner);
    }

    /// @notice Get the full ownership history array length.
    function getOwnershipHistoryLength(string memory _propertyId)
        public
        view
        propertyExists(_propertyId)
        returns (uint256)
    {
        return ownershipHistory[_propertyId].length;
    }

    /// @notice Get a single ownership history record by index.
    function getOwnershipHistoryAt(string memory _propertyId, uint256 index)
        public
        view
        propertyExists(_propertyId)
        returns (
            address from,
            address to,
            uint256 price,
            string memory transferType,
            uint256 timestamp
        )
    {
        TransferRecord memory r = ownershipHistory[_propertyId][index];
        return (r.from, r.to, r.price, r.transferType, r.timestamp);
    }
}
