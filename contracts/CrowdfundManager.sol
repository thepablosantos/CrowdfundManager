// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title CrowdfundManager
 * @dev Manages multiple crowdfunding campaigns
 */
contract CrowdfundManager {
    struct Campaign {
        address owner;
        uint goal;
        uint totalRaised;
        string title;
        string description;
        bool ended;
    }

    // List of all campaigns
    Campaign[] public campaigns;

    // Mapping (campaignId -> (donor address -> amount donated))
    mapping(uint => mapping(address => uint)) public contributions;

    event CampaignCreated(uint indexed campaignId, address indexed owner, uint goal);
    event DonationReceived(uint indexed campaignId, address indexed donor, uint amount);
    event CampaignEnded(uint indexed campaignId, uint totalRaised);

    /**
     * @notice Create a new crowdfunding campaign
     * @param _goal The fundraising goal (in wei)
     * @param _title A short title for the campaign
     * @param _description A brief description
     */
    function createCampaign(uint _goal, string calldata _title, string calldata _description) external {
        campaigns.push(Campaign({
            owner: msg.sender,
            goal: _goal,
            totalRaised: 0,
            title: _title,
            description: _description,
            ended: false
        }));

        uint campaignId = campaigns.length - 1;
        emit CampaignCreated(campaignId, msg.sender, _goal);
    }

    /**
     * @notice Contribute to a specific campaign
     * @param _campaignId The ID of the campaign in `campaigns`
     */
    function donate(uint _campaignId) external payable {
        require(_campaignId < campaigns.length, "Invalid campaign ID");
        Campaign storage c = campaigns[_campaignId];
        require(!c.ended, "Campaign ended");

        c.totalRaised += msg.value;
        contributions[_campaignId][msg.sender] += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    /**
     * @notice End a campaign and withdraw funds (only owner)
     * @param _campaignId The ID of the campaign
     */
    function endCampaign(uint _campaignId) external {
        require(_campaignId < campaigns.length, "Invalid campaign ID");
        Campaign storage c = campaigns[_campaignId];
        require(!c.ended, "Already ended");
        require(msg.sender == c.owner, "Not owner");

        c.ended = true;
        payable(c.owner).transfer(c.totalRaised);

        emit CampaignEnded(_campaignId, c.totalRaised);
    }

    /**
     * @return The total number of campaigns
     */
    function getCampaignCount() external view returns (uint) {
        return campaigns.length;
    }
}