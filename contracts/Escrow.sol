// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}



contract Escrow {
    address public nftAddress;
    address payable public seller; // Seller should be payable
    address public lender;
    address public inspector;

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }    

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;


    constructor(
        address _nftAddress, 
        address payable _seller, 
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    //Transfer NFT from seller to this Escrow contract
    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice, 
        uint256 _escrowAmount
    ) public payable onlySeller {

        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    //Buyer Action - Escrow amount is like a Down payment paid by buyer
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }

    //Update Inspection Status for NFT - 
    //Only Inspector can call this function
    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    //Function to Approve Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    //Function to finalize sale
    // -> Require inspection status
    // -> Require sale to be approved
    // -> Require funds to be correct amount
    // -> De-list the NFT
    // -> Transfer NFT to buyer
    // -> Transfer Funds to seller
    function finalizeSale(uint256 _nftID) public {

        //1. Require inspection status
        require(inspectionPassed[_nftID] == true, "Inspection isn't pending");
        
        //2. Require approval status from multiple parties
        require(approval[_nftID][buyer[_nftID]] == true);
        require(approval[_nftID][seller] == true);
        require(approval[_nftID][lender] == true);

        //3. Ensure escrow contract is fully funded
        require(address(this).balance >= purchasePrice[_nftID]);

        //4. Delist the NFT
        isListed[_nftID] = false;

        //5. Transfer Ether from Escrow to Seller
        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success);

        //6. Transfer NFT ownership to buyer
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);

    }

    //Function - Cancel sale
    // -> If inspection status is not approved, then refund
    // function cancelSale()


    //Function to receive the balance
    receive() external payable {

    }

    //Function to return the current ether balance of Contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }


}