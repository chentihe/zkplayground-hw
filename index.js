import ethers from "ethers";
import { MerkleTree } from "merkletreejs";
import Web3 from "web3";

const PUBLIC_KEY = "{YOUR_PUBLIC_KEY}";
const PRIVATE_KEY = "{YOUR_PRIVATE_KEY}";
const ZK_ADDRESS = "0x847FB490b9255758738c1DBddD9E3049E9bC86c8";
const ZK_PLAYGROUND =
  "0x760785a457f46af4582b62962c4d96be98c68df9619556fa20af3c286343bf81";
  const ZK_LEAF = [
    "0x760785a457f46af4582b62962c4d96be98c68df9619556fa20af3c286343bf81",
    "0x2098ddd01d6035049de112333af26442bb3009ea06b6df66fccfadf8adee9914",
    "0x4648dfc788d015b20cb30bd312820680fe7f126a5211202b924ea67fe8cc3cfe",
    "0xb592fdc51ce49d7670e27b3a500873a78d0f29b39d1f368cf73e7b38a6c206d7",
    "0xb3c8b2632ac575ad8f94d4adc98aeeba6f87ca0b01c85f2faac2271cf67787ca",
    "0x395655712d1d58a4a7e3f01fd78482cba8477f8cfbf7a08202477c1baa15a335",
    "0x777726d7bfa53f1c91ec1485ed098db792c3e326b98ece6bd9761a43315b7cf3",
  ];


// ============================= ethers.js start =============================
const ZK_ABI = [
  "function hashes(uint256 _param1) public view returns (bytes32)",
  "function claim(uint256 _amountInFinney) public payable",
  "function merkleProof(bytes32[] memory proof) public",
];

const provider = ethers.getDefaultProvider("goerli");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const zk = new ethers.Contract(ZK_ADDRESS, ZK_ABI, wallet);

// #1 transfer ethers
wallet.sendTransaction({
  to: zk.address,
  value: ethers.utils.parseEther("0.001").toNumber(),
});

// #3 claim ethers
let tx = await zk.claim(1);
const claim = await tx.wait();
console.log(claim);

// #4 merkle tree
const hashes = [];
for (let i = 0; i < 7; i++) {
  const zkHash = await zk.hashes(i);
  hashes.push(zkHash);
}
console.log(hashes);

// merkle proof
const merkleTree = new MerkleTree(ZK_LEAF, ethers.utils.keccak256, {
  sortPairs: true,
});
const rootHash = merkleTree.getHexRoot();
const merkleProof = merkleTree.getHexProof(ZK_PLAYGROUND);
tx = await zk.merkleProof(merkleProof);
const result = await tx.wait();
console.log(result);
// ============================= ethers.js end =============================

// ============================= web3.js start =============================
const GOERLI_APIKEY =
  "https://eth-goerli.g.alchemy.com/v2/zwbegt4hOIB96KURkujUAVanT4W0T5hH";

const abi = [
  {
    constant: false,
    inputs: [
      {
        name: "_amountInFinney",
        type: "uint256",
      },
    ],
    name: "claim",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "hashes",
    outputs: [
      {
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "merkleProof",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const web3 = new Web3(GOERLI_APIKEY);
const contract = new web3.eth.Contract(abi, ZK_ADDRESS);

// ============================= web3.js tx object =============================
// #1 transfer ethers
tx = {
  from: PUBLIC_KEY,
  to: contract.options.address,
  value: web3.utils.toWei("0.001", "ether"),
  gas: 210000,
};
let signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, hash) => {
  if (!error) {
    console.log("🎉 The hash of your transaction is: ", hash);
  } else {
    console.log(
      "❗Something went wrong while submitting your transaction:",
      error
    );
  }
});

// #3 claim ethers
data = await contract.methods.claim(1);
tx = {
  from: PUBLIC_KEY,
  to: contract.options.address,
  gas: await data.estimateGas({ from: PUBLIC_KEY }),
  data: data.encodeABI(),
};
signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, hash) => {
  if (!error) {
    console.log("🎉 The hash of your transaction is: ", hash);
  } else {
    console.log(
      "❗Something went wrong while submitting your transaction:",
      error
    );
  }
});

// #4 merkle tree
data = await contract.methods.merkleProof(merkleProof);
tx = {
  from: PUBLIC_KEY,
  to: contract.options.address,
  gas: await data.estimateGas({ from: PUBLIC_KEY }),
  data: data.encodeABI(),
};

signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, hash) => {
  if (!error) {
    console.log("🎉 The hash of your transaction is: ", hash);
  } else {
    console.log(
      "❗Something went wrong while submitting your transaction:",
      error
    );
  }
});

// ============================= web3.js inject account =============================
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// #3 claim ethers
await contract.methods
  .claim(1)
  .send()
  .then((error, hash) => {
    if (!error) {
      console.log("🎉 The hash of your transaction is: ", hash);
    } else {
      console.log(
        "❗Something went wrong while submitting your transaction:",
        error
      );
    }
  });

// #4 merkle tree
await contract.methods
  .merkleProof(merkleProof)
  .send()
  .then((error, hash) => {
    if (!error) {
      console.log("🎉 The hash of your transaction is: ", hash);
    } else {
      console.log(
        "❗Something went wrong while submitting your transaction:",
        error
      );
    }
  });
// ============================= web3.js end =============================
