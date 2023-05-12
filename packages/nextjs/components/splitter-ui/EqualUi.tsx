import React, { useEffect, useState } from "react";
import TokenData from "./splitter-components/TokenData";
import { ethers } from "ethers";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const EqualUi = ({ splitItem, account, splitterContract }: { splitItem: string }) => {
  const [amount, setamount] = useState("");
  const [wallets, setWallets] = useState<string[]>([]);

  const [totalAmount, setTotalAmount] = useState("");
  const [tokenContract, setTokenContract] = useState("");

  function addMultipleAddress(value: string) {
    const validateAddress = (address: string) => address.includes("0x") && address.length === 42;
    let addresses: string[];
    if (value.includes(",")) {
      addresses = value
        .trim()
        .split(",")
        .map(str => str.replace(/\n/g, "").replace(/\s/g, ""));
    } else {
      addresses = value
        .trim()
        .split(/\s+/)
        .map(str => str.replace(/\s/g, ""));
    }

    let uniqueAddresses = [...new Set([...addresses])];

    uniqueAddresses = uniqueAddresses.filter(validateAddress);

    setWallets(uniqueAddresses);
  }
  const { writeAsync: splitEqualETH, isLoading: splitEthLoading } = useScaffoldContractWrite(
    "ETHSplitter",
    "splitEqualETH",
    [wallets],
    totalAmount.toString(),
  );

  const { writeAsync: splitEqualERC20, isLoading: splitErc20Loading } = useScaffoldContractWrite(
    "ETHSplitter",
    "splitEqualERC20",
    [tokenContract, wallets, totalAmount.toString()],
  );

  useEffect(() => {
    let totalAmount: any = 0;
    for (let index = 0; index < wallets.length; index++) {
      if (wallets[index] === "" || amount === "") {
        return;
      }
      totalAmount += parseFloat(amount);
    }
    if (splitItem === "split-tokens") {
      totalAmount = ethers.utils.parseEther(totalAmount.toFixed(18));
    } else {
      totalAmount = totalAmount.toFixed(18);
    }
    setTotalAmount(totalAmount);
  }, [amount, wallets, splitItem]);

  return (
    <>
      {splitItem === "split-tokens" && (
        <TokenData
          splitErc20Loading={splitErc20Loading}
          account={account}
          splitterContract={splitterContract}
          setTokenContract={setTokenContract}
          tokenContract={tokenContract}
        />
      )}
      <div className="mx-auto my-14">
        <form className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2">
          <div className="flex flex-col space-y-1 w-full my-1">
            <p className="font-semibold  ml-1 my-0 break-words">
              {splitItem === "split-eth" ? "ETH Amount Each" : "Token Amount Each"}
            </p>
            <div
              className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
            >
              <input
                type="number"
                value={amount}
                min={0}
                onChange={e => setamount(e.target.value)}
                className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  border w-full font-medium placeholder:text-accent/50 text-gray-400"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1 w-full my-1 ">
            <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>
            <div
              className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-xl text-accent w-full`}
            >
              <textarea
                placeholder="Seperate each address with a comma"
                // value={wallets}
                onChange={e => addMultipleAddress(e.target.value)}
                className="textarea rounded-none textarea-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  min-h-[11.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
              />
            </div>
          </div>
          <p className="ml-2 -mt-1">valid unique addresses: {wallets.length}</p>
          <div className="my-[10px] w-full space-y-4">
            <button
              type="button"
              disabled={wallets.length <= 1 || totalAmount === 0}
              onClick={async () => {
                splitItem === "split-eth" ? await splitEqualETH() : await splitEqualERC20();
              }}
              className={`btn btn-primary w-full font-black `}
            >
              {splitItem === "split-eth" ? "Split ETH" : "Split Tokens"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EqualUi;
