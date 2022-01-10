// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

import "./Parcel.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @notice Produces parcel contracts via cloning.
/// @author Aneesh Sachdeva
/// @dev Use the factory to deploy new parcels. The factory contains the byte
/// @dev code for the contract and simply initializes new parcels using this
/// @dev code. This greatly reduces gas costs for parcel deployment since new
/// @dev bytecode is not loaded on-chain with each deployment.
contract ParcelFactory is Ownable, Pausable {
    /// @notice Address of the cloneable parcel contract.
    address payable immutable parcelImpl;

    /// @notice Emitted when a parcel is cloned.
    /// @param parcel Address of the new parcel contract.
    /// @param sender Address of the parcel creator. 
    event ParcelCreated(address parcel, address sender);

    constructor() {
        parcelImpl = payable(address(new Parcel()));
    }

    /// @notice Clone a parcel and set transaction signer as the parcel owner.
    /// @param hashedSecret keccack256 hash of the secret used to unlock the parcel.
    /// @return Address of the new parcel clone. 
    function createParcel(
        bytes32 hashedSecret
    ) external whenNotPaused returns (address payable) {
        address payable clone = payable(Clones.clone(parcelImpl));
        Parcel(clone).initialize(hashedSecret, msg.sender);

        emit ParcelCreated(clone, msg.sender);
        
        return clone;
    }

    /// @notice Pauses parcel creation. Only factory owner can call this.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resumes parcel creation. Only factory owner can call this. 
    function unpause() external onlyOwner {
        _unpause();
    }
}