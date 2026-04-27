// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TrustToken is ERC20, AccessControl {
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

	event DonationLogged(
		address indexed donor,
		address indexed ngo,
		uint256 amount,
		bytes32 indexed donationId,
		uint256 timestamp
	);

	constructor() ERC20("TrustAid Token", "TRUST") {
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
		_grantRole(MINTER_ROLE, msg.sender);
	}

	function logDonation(
		address donor,
		address ngo,
		uint256 amount,
		bytes32 donationId
	) external onlyRole(MINTER_ROLE) {
		require(donor != address(0), "Invalid donor");
		require(ngo != address(0), "Invalid NGO");
		require(amount > 0, "Amount must be > 0");

		_mint(donor, amount);
		_transfer(donor, ngo, amount);

		emit DonationLogged(donor, ngo, amount, donationId, block.timestamp);
	}
}

