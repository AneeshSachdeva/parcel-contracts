/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  Overrides,
  BytesLike,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Parcel, ParcelInterface } from "../Parcel";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hashedSecret_",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidState",
    type: "error",
  },
  {
    inputs: [],
    name: "ParcelIsLocked",
    type: "error",
  },
  {
    inputs: [],
    name: "PermissionDenied",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "ParcelEmptied",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "addTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ethBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isCommunal",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "makeCommunal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "secret",
        type: "bytes32",
      },
    ],
    name: "open",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sender",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "state",
    outputs: [
      {
        internalType: "enum Parcel.State",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "tokenBalanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "newHashedSecret",
        type: "bytes32",
      },
    ],
    name: "updateHashedSecret",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162001a2138038062001a2183398181016040528101906200003791906200009d565b33600060026101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508060058190555050620000ed565b6000815190506200009781620000d3565b92915050565b600060208284031215620000b057600080fd5b6000620000c08482850162000086565b91505092915050565b6000819050919050565b620000de81620000c9565b8114620000ea57600080fd5b50565b61192480620000fd6000396000f3fe6080604052600436106100a05760003560e01c806367e404ce1161006457806367e404ce146104965780637e10a5ac146104c1578063c19d93fb146104d8578063d3b3f73a14610503578063e42c08f21461052c578063f83d08ba146105695761022b565b8063150b7a02146103b15780632524f9a3146103ee578063433f0f18146104175780634e6630b0146104425780636039fbdb1461046d5761022b565b3661022b57600060028111156100df577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60008054906101000a900460ff166002811115610125577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b14610165576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161015c90611456565b60405180910390fd5b600060019054906101000a900460ff161580156101d05750600060029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b15610210576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610207906113d6565b60405180910390fd5b346001600082825461022291906114ed565b92505081905550005b60006002811115610265577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60008054906101000a900460ff1660028111156102ab577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b146102eb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102e290611456565b60405180910390fd5b600060019054906101000a900460ff161580156103565750600060029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b15610396576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161038d906113d6565b60405180910390fd5b34600160008282546103a891906114ed565b92505081905550005b3480156103bd57600080fd5b506103d860048036038101906103d39190611041565b610580565b6040516103e59190611380565b60405180910390f35b3480156103fa57600080fd5b5061041560048036038101906104109190611126565b610595565b005b34801561042357600080fd5b5061042c61062f565b6040516104399190611365565b60405180910390f35b34801561044e57600080fd5b50610457610642565b60405161046491906114b6565b60405180910390f35b34801561047957600080fd5b50610494600480360381019061048f91906110c1565b610648565b005b3480156104a257600080fd5b506104ab610962565b6040516104b891906112ea565b60405180910390f35b3480156104cd57600080fd5b506104d6610988565b005b3480156104e457600080fd5b506104ed610a35565b6040516104fa919061139b565b60405180910390f35b34801561050f57600080fd5b5061052a60048036038101906105259190611126565b610a46565b005b34801561053857600080fd5b50610553600480360381019061054e9190611018565b610d4d565b60405161056091906114b6565b60405180910390f35b34801561057557600080fd5b5061057e610d65565b005b600063150b7a0260e01b905095945050505050565b600060029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610625576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161061c90611496565b60405180910390fd5b8060058190555050565b600060019054906101000a900460ff1681565b60015481565b60006002811115610682577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60008054906101000a900460ff1660028111156106c8577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b14610708576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106ff90611456565b60405180910390fd5b600060019054906101000a900460ff161580156107735750600060029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b156107b3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107aa906113d6565b60405180910390fd5b600082905060008173ffffffffffffffffffffffffffffffffffffffff166323b872dd3330866040518463ffffffff1660e01b81526004016107f793929190611305565b602060405180830381600087803b15801561081157600080fd5b505af1158015610825573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061084991906110fd565b90508061088b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610882906113b6565b60405180910390fd5b82600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546108da91906114ed565b925050819055506003849080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600460008154809291906109579061161a565b919050555050505050565b600060029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600060029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610a18576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a0f90611496565b60405180910390fd5b6001600060016101000a81548160ff021916908315150217905550565b60008054906101000a900460ff1681565b60016002811115610a80577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60008054906101000a900460ff166002811115610ac6577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b14610b06576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610afd906113f6565b60405180910390fd5b8060055414610b4a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b4190611476565b60405180910390fd5b60026000806101000a81548160ff02191690836002811115610b95577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b021790555060006001541115610c635760006001549050600060018190555060003373ffffffffffffffffffffffffffffffffffffffff1682604051610bda906112d5565b60006040518083038185875af1925050503d8060008114610c17576040519150601f19603f3d011682016040523d82523d6000602084013e610c1c565b606091505b5050905080610c60576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c5790611436565b60405180910390fd5b50505b60006004541115610d4a5760005b600454811015610d4857600060038281548110610cb7577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9060005260206000200160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050610d33823383610e47565b50508080610d409061161a565b915050610c71565b505b50565b60026020528060005260406000206000915090505481565b600060029054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610df5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dec90611496565b60405180910390fd5b60016000806101000a81548160ff02191690836002811115610e40577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b0217905550565b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610e969190611543565b92505081905550600083905060008173ffffffffffffffffffffffffffffffffffffffff1663a9059cbb85856040518363ffffffff1660e01b8152600401610edf92919061133c565b602060405180830381600087803b158015610ef957600080fd5b505af1158015610f0d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f3191906110fd565b905080610f73576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f6a90611416565b60405180910390fd5b5050505050565b600081359050610f8981611892565b92915050565b600081519050610f9e816118a9565b92915050565b600081359050610fb3816118c0565b92915050565b60008083601f840112610fcb57600080fd5b8235905067ffffffffffffffff811115610fe457600080fd5b602083019150836001820283011115610ffc57600080fd5b9250929050565b600081359050611012816118d7565b92915050565b60006020828403121561102a57600080fd5b600061103884828501610f7a565b91505092915050565b60008060008060006080868803121561105957600080fd5b600061106788828901610f7a565b955050602061107888828901610f7a565b945050604061108988828901611003565b935050606086013567ffffffffffffffff8111156110a657600080fd5b6110b288828901610fb9565b92509250509295509295909350565b600080604083850312156110d457600080fd5b60006110e285828601610f7a565b92505060206110f385828601611003565b9150509250929050565b60006020828403121561110f57600080fd5b600061111d84828501610f8f565b91505092915050565b60006020828403121561113857600080fd5b600061114684828501610fa4565b91505092915050565b61115881611577565b82525050565b61116781611589565b82525050565b6111768161159f565b82525050565b61118581611608565b82525050565b60006111986024836114dc565b91506111a3826116c1565b604082019050919050565b60006111bb6034836114dc565b91506111c682611710565b604082019050919050565b60006111de600e836114dc565b91506111e98261175f565b602082019050919050565b60006112016012836114dc565b915061120c82611788565b602082019050919050565b60006112246014836114dc565b915061122f826117b1565b602082019050919050565b6000611247601c836114dc565b9150611252826117da565b602082019050919050565b600061126a6000836114d1565b915061127582611803565b600082019050919050565b600061128d6011836114dc565b915061129882611806565b602082019050919050565b60006112b06025836114dc565b91506112bb8261182f565b604082019050919050565b6112cf816115fe565b82525050565b60006112e08261125d565b9150819050919050565b60006020820190506112ff600083018461114f565b92915050565b600060608201905061131a600083018661114f565b611327602083018561114f565b61133460408301846112c6565b949350505050565b6000604082019050611351600083018561114f565b61135e60208301846112c6565b9392505050565b600060208201905061137a600083018461115e565b92915050565b6000602082019050611395600083018461116d565b92915050565b60006020820190506113b0600083018461117c565b92915050565b600060208201905081810360008301526113cf8161118b565b9050919050565b600060208201905081810360008301526113ef816111ae565b9050919050565b6000602082019050818103600083015261140f816111d1565b9050919050565b6000602082019050818103600083015261142f816111f4565b9050919050565b6000602082019050818103600083015261144f81611217565b9050919050565b6000602082019050818103600083015261146f8161123a565b9050919050565b6000602082019050818103600083015261148f81611280565b9050919050565b600060208201905081810360008301526114af816112a3565b9050919050565b60006020820190506114cb60008301846112c6565b92915050565b600081905092915050565b600082825260208201905092915050565b60006114f8826115fe565b9150611503836115fe565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561153857611537611663565b5b828201905092915050565b600061154e826115fe565b9150611559836115fe565b92508282101561156c5761156b611663565b5b828203905092915050565b6000611582826115de565b9050919050565b60008115159050919050565b6000819050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b60008190506115d98261187e565b919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b6000611613826115cb565b9050919050565b6000611625826115fe565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561165857611657611663565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f546f6b656e73206661696c656420746f207472616e7366657220746f2070617260008201527f63656c2e00000000000000000000000000000000000000000000000000000000602082015250565b7f50617263656c206973206e6f7420636f6d6d756e616c20616e642063616e6e6f60008201527f742061636365707420796f75722061737365742e000000000000000000000000602082015250565b7f496e76616c69642073746174652e000000000000000000000000000000000000600082015250565b7f4661696c656420746f207472616e736665720000000000000000000000000000600082015250565b7f455448207472616e73666572206661696c65642e000000000000000000000000600082015250565b7f50617263656c2063616e27742072656365697665206173736574732e00000000600082015250565b50565b7f496e636f7272656374207365637265742e000000000000000000000000000000600082015250565b7f4f6e6c79207468652070617263656c2073656e6465722063616e2063616c6c2060008201527f746869732e000000000000000000000000000000000000000000000000000000602082015250565b6003811061188f5761188e611692565b5b50565b61189b81611577565b81146118a657600080fd5b50565b6118b281611589565b81146118bd57600080fd5b50565b6118c981611595565b81146118d457600080fd5b50565b6118e0816115fe565b81146118eb57600080fd5b5056fea26469706673582212205a3f5263699ec5849c7654aaf1ffae9f35579190aebd5417657b90fa2bd403e864736f6c63430008040033";

type ParcelConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ParcelConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Parcel__factory extends ContractFactory {
  constructor(...args: ParcelConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    hashedSecret_: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Parcel> {
    return super.deploy(hashedSecret_, overrides || {}) as Promise<Parcel>;
  }
  getDeployTransaction(
    hashedSecret_: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(hashedSecret_, overrides || {});
  }
  attach(address: string): Parcel {
    return super.attach(address) as Parcel;
  }
  connect(signer: Signer): Parcel__factory {
    return super.connect(signer) as Parcel__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ParcelInterface {
    return new utils.Interface(_abi) as ParcelInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Parcel {
    return new Contract(address, _abi, signerOrProvider) as Parcel;
  }
}
