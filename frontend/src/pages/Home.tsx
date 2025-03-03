// src/pages/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Contract } from 'ethers';
import type { Signer } from 'ethers';

/**
 * ABI do seu CrowdfundManager (exemplo):
 * - createCampaign(uint _goal, string _title, string _description)
 * - donate(uint _campaignId) payable
 * - endCampaign(uint _campaignId)
 * - getCampaignCount()
 * - campaigns(uint) => (owner, goal, totalRaised, title, description, ended)
 */
const crowdfundAbi = [
  "function createCampaign(uint256 _goal, string _title, string _description) external",
  "function donate(uint256 _campaignId) external payable",
  "function endCampaign(uint256 _campaignId) external",
  "function getCampaignCount() external view returns (uint256)",
  "function campaigns(uint256) external view returns (address owner, uint256 goal, uint256 totalRaised, string title, string description, bool ended)"
];

// Endereço obtido ao fazer deploy no Hardhat local
const crowdfundAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface Campaign {
  id: number;
  owner: string;
  goal: string;
  totalRaised: string;
  title: string;
  description: string;
  ended: boolean;
}

export default function Home() {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [campaignCount, setCampaignCount] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Para criar uma nova campanha (Goal, Title, Desc)
  const [newGoal, setNewGoal] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Obtemos o contrato
  function getContract(): Contract | null {
    if (!walletClient) return null;
    // Cast walletClient -> Signer
    const signer = walletClient as unknown as Signer;
    return new Contract(crowdfundAddress, crowdfundAbi, signer);
  }

  // Carrega o número total de campaigns
  const loadCampaignCount = useCallback(async () => {
    const c = getContract();
    if (!c) return;
    const result = await c.getCampaignCount();
    setCampaignCount(Number(result));
  }, [walletClient]);

  // Carrega detalhes de cada campaign
  const loadAllCampaigns = useCallback(async () => {
    const c = getContract();
    if (!c) return;
    const countBn = await c.getCampaignCount();
    const countNum = Number(countBn);

    const arr: Campaign[] = [];
    for (let i = 0; i < countNum; i++) {
      const data = await c.campaigns(i);
      /**
       * data = [
       *   owner (string),
       *   goal (BigNumber),
       *   totalRaised (BigNumber),
       *   title (string),
       *   description (string),
       *   ended (bool)
       * ]
       */
      arr.push({
        id: i,
        owner: data[0],
        goal: data[1].toString(),
        totalRaised: data[2].toString(),
        title: data[3],
        description: data[4],
        ended: data[5]
      });
    }
    setCampaigns(arr);
  }, [walletClient]);

  // Cria uma nova campaign
  async function createCampaign() {
    const c = getContract();
    if (!c) return;
    try {
      const tx = await c.createCampaign(BigInt(newGoal), newTitle, newDesc);
      await tx.wait();
      alert("Campaign created successfully!");
      // atualiza a lista
      loadCampaignCount();
      loadAllCampaigns();
    } catch (err) {
      console.error(err);
      alert("Error creating campaign");
    }
  }

  // Doa 0.01 ETH para a campaign
  async function donate(campaignId: number) {
    const c = getContract();
    if (!c) return;
    try {
      const tx = await c.donate(campaignId, { value: 10000000000000000n }); // 0.01 ETH
      await tx.wait();
      alert("Donation successful!");
      loadAllCampaigns();
    } catch (err) {
      console.error(err);
      alert("Error donating");
    }
  }

  // Encerra a campaign (dono pode retirar funds)
  async function endCampaign(campaignId: number) {
    const c = getContract();
    if (!c) return;
    try {
      const tx = await c.endCampaign(campaignId);
      await tx.wait();
      alert("Campaign ended");
      loadAllCampaigns();
    } catch (err) {
      console.error(err);
      alert("Error ending campaign");
    }
  }

  // Carrega dados iniciais no mount
  useEffect(() => {
    loadCampaignCount();
    loadAllCampaigns();
  }, [loadCampaignCount, loadAllCampaigns]);

  if (!isConnected) {
    return <p>Please connect your wallet.</p>;
  }

  return (
    <div>
      <h2>Total Campaigns: {campaignCount}</h2>

      {/* Formulário para criar nova campaign */}
      <div style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
        <h3>Create a Campaign</h3>
        <input
          type="text"
          placeholder="Goal in wei"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <br />
        <button onClick={createCampaign}>Create</button>
      </div>

      {/* Lista de campaigns */}
      {campaigns.map((cam) => {
        const progress = parseFloat(cam.goal) > 0
          ? (parseFloat(cam.totalRaised) / parseFloat(cam.goal)) * 100
          : 0;

        return (
          <div key={cam.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
            <h4>{cam.title}</h4>
            <p>{cam.description}</p>
            <p><b>Goal:</b> {cam.goal} wei</p>
            <p><b>Raised:</b> {cam.totalRaised} wei</p>
            <p><b>Progress:</b> {progress.toFixed(2)}%</p>
            <p><b>Owner:</b> {cam.owner}</p>
            <p><b>Ended?</b> {cam.ended ? "Yes" : "No"}</p>

            {!cam.ended && (
              <div>
                <button onClick={() => donate(cam.id)}>Donate 0.01 ETH</button>
                <button style={{ marginLeft: 10 }} onClick={() => endCampaign(cam.id)}>
                  End Campaign
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}