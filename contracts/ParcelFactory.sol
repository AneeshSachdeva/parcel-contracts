pragma solidity >= 0.7.0 < 0.9.0;

import "./Parcel.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract ParcelFactory {
    address payable immutable parcelImpl;

    event ParcelCreated(address _clone);

    constructor() {
        parcelImpl = payable(address(new Parcel()));
    }

    function createParcel(
        bytes32 hashedSecret
    ) external returns (address payable) {
        address payable clone = payable(Clones.clone(parcelImpl));
        Parcel(clone).initialize(hashedSecret, msg.sender);

        emit ParcelCreated(clone);
        
        return clone;
    }
}