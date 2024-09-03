const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {

    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async () => {

        //Setup accounts
        //Signers are people on blockchain, who sign transactions and put them on blockchain
        //We assign buyers & sellers among from these signers for our usecase.
        [buyer, seller, inspector, lender] = await ethers.getSigners();


        //1. Deploy RealEstate Contract
        //1.1 Gets the compiled contract from hardhat
        const RealEstate = await ethers.getContractFactory('RealEstate')
        //1.2 Deploy the compiled contract to blockchain
        realEstate = await RealEstate.deploy()
        //1.3 Logs contract address
        // console.log(realEstate.address);

        //2. Mint the NFT on behalf of seller
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
        await transaction.wait();


        //Deploy Escrow contract
        const Escrow = await ethers.getContractFactory('Escrow');
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        //Approve Property.
        //function -> approve(to, tokenId)
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait();

        //List the RealEstate Property
        //We are sending control to Escrow hence transferring nft to Escrow contract
        //function -> list(tokenId, buyerAddress, purchasePrice, escrowAmount) is a function 
        //created in RealEstate contract
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5));
        await transaction.wait();

    })

    describe('Deployment', () => {

        it('Returns NFT address', async () => {
            let result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address);
        })
    
        it('Returns seller', async () => {
            let result = await escrow.seller();
            expect(result).to.be.equal(seller.address);            
        })    
    
        it('Returns inspector', async () => {
            let result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address);   
        })    
        
        it('Returns lender', async () => {
            let result = await escrow.lender();
            expect(result).to.be.equal(lender.address);   
        })        
    })


    describe('Listing', () => {

        it('Checks if Listed', async () => {
            const result = await escrow.isListed(1);
            expect(result).to.be.equal(true);
        })

        it('Updates the ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
        })

        it('returns buyer', async () => {
            const result = await escrow.buyer(1);
            expect(result).to.be.equal(buyer.address);
        })

        it('returns purchase price', async () => {
            const result = await escrow.purchasePrice(1);
            expect(result).to.be.equal(tokens(10));
        })
        
        it('returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1);
            expect(result).to.be.equal(tokens(5));
        })        

    })

    describe('Deposits', () => {
        it('Updates Escrow contract balance', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait();
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        }) 
    })

    describe('Inspection', () => {
        it('Updates Inspection Status', async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true);
            await transaction.wait();
            const result = await escrow.inspectionPassed(1);
            expect(result).to.be.equal(true)
        })         
    }) 
    
    describe('Approval', () => {
        it('Updates Approve Status', async () => {
            let transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();

            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })         
    })     

    describe('Finalizing Sale', () => {

        beforeEach(async () => {

            //Buyer deposits Earnest money to Escrow contract
            let transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)});
            await transaction.wait();

            //Inspector updates the inspection status
            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true);
            await transaction.wait();


            //Buyer/Seller/Lender approves the sale
            transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();


            //Transfer extra money from lender to escrow contract to fund the deal.
            await lender.sendTransaction( {to: escrow.address, value: tokens(5)})

            //Finalize sale
            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait();
        
        })

        it('Updates balance', async () => {
            expect(await escrow.getBalance()).to.be.equal(0);
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })        

    }) 


})
