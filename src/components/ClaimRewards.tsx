import { useState } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { stakingContractAddress, stakingContractABI } from '../lib/contracts';
import { ethers } from 'ethers';
import { useNotification } from './NotificationProvider';

export function ClaimRewards() {
  const { address } = useAccount();
  const { showSuccess, showError } = useNotification();

  // Check user's pending rewards
  const { data: pendingRewards } = useReadContract({
    address: stakingContractAddress,
    abi: stakingContractABI,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint | undefined };

  const { writeContractAsync: claim, data: claimTxHash } = useWriteContract();

  const { isLoading: isClaimLoading } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  const handleClaim = async () => {
    if (!address) return;

    // Check if user has rewards to claim
    const rewardsAmount = pendingRewards || BigInt(0);
    if (rewardsAmount === BigInt(0)) {
      showError('No Rewards Available', 'You have no rewards available to claim at this time.');
      return;
    }

    try {
      await claim({
        address: stakingContractAddress,
        abi: stakingContractABI,
        functionName: 'claimRewards',
      });

      showSuccess('Rewards Claimed!', `Successfully claimed ${ethers.formatEther(rewardsAmount)} HAPG tokens!`);
    } catch (error: unknown) {
      console.error('Claim failed:', error);
      showError('Claim Failed', error instanceof Error ? error.message : 'Claim failed. Please try again.');
    }
  };

  const rewardsAmount = pendingRewards || BigInt(0);

  return (
    <div className="space-y-4">
      {/* Pending Rewards Display */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">Pending Rewards:</span> {ethers.formatEther(rewardsAmount)} tokens
        </p>
      </div>

      <button
        onClick={handleClaim}
        disabled={!address || isClaimLoading || rewardsAmount === BigInt(0)}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed btn-crystal-primary btn-glow-yellow btn-ripple shadow-crystal"
      >
        {isClaimLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Claiming...
          </div>
        ) : rewardsAmount === BigInt(0) ? (
          'No Rewards Available'
        ) : (
          'Claim Rewards'
        )}
      </button>
    </div>
  );
}
