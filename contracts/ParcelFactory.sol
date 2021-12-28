pragma solidity >= 0.7.0 < 0.9.0;

import "./Parcel.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ParcelFactory is Ownable, Pausable {
    address payable immutable parcelImpl;

    event ParcelCreated(address parcel, address sender);

    constructor() {
        parcelImpl = payable(address(new Parcel()));
    }

    function createParcel(
        bytes32 hashedSecret
    ) external whenNotPaused returns (address payable) {
        address payable clone = payable(Clones.clone(parcelImpl));
        Parcel(clone).initialize(hashedSecret, msg.sender);

        emit ParcelCreated(clone, msg.sender);
        
        return clone;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}