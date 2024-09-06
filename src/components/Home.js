import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {


    const [buyer, setBuyer] = useState(null);
    const [lender, setLender] = useState(null);
    const [inspector, setInspector] = useState(null);
    const [seller, setSeller] = useState(null);
    const [owner, setOwner] = useState(null);

    const [hasBought, setHasBought] = useState(null);
    const [hasLended, setHasLended] = useState(null);
    const [hasInspected, setHasInspected] = useState(null);
    const [hasSold, setHasSold] = useState(null);

    const fetchDetails = async () => {

        //Buyer
        const buyer = await escrow.buyer(home.id);
        setBuyer(buyer);

        //Has Bought
        const hasBought = await escrow.approval(home.id, buyer);
        setHasBought(hasBought);

        //Seller
        const seller = await escrow.seller();
        setSeller(seller);

        //Has Sold
        const hasSold = await escrow.approval(home.id, seller);
        setHasSold(hasSold);

        //Lender
        const lender = await escrow.lender();
        setLender(lender);

        //Has Lended
        const hasLended = await escrow.approval(home.id, lender);
        setHasLended(hasLended);

        //Inspector
        const inspector = await escrow.inspector();
        setInspector(inspector);

        //Has Inspected
        const hasInspected= await escrow.approval(home.id, inspector);
        setHasInspected(hasInspected);

    }

    const fetchOwner = async () => {

        //If property is listed it means, seller is the owner
        if(await escrow.isListed(home.id)) return 

        //If propery is not listed it means buyer has bought it.
        const owner = await escrow.buyer(home.id);
        setOwner(owner);
    }

    //Buying the property
    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id);

        //Gets the current account logged in metamask
        const signer = await provider.getSigner();

        //Buyer deposit earnest amount
        let transaction = await escrow.connect(signer).depositEarnest(home.id, {value : escrowAmount});
        await transaction.wait();

        //Buyer approves
        transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        hasBought(true)
    }

    const inspectHandler = async () => {

        const signer = await provider.getSigner();

        //Inspector inspects the property
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true);
        await transaction.wait();

        setHasInspected(true);

    }
    
    const lendHandler = async () => {
     
        const signer = await provider.getSigner();

        //Lender approves
        const transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        //Lender sends funds to the escrow contract
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id));
        await signer.sendTransaction({to : escrow.address, value: lendAmount.toString(), gasLimit: 60000 });

        setHasLended(true);        
    }

    const sellHandler = async () => {
        
        const signer = await provider.getSigner();

        //Seller approves
        let transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        //Seller finalize, i.e transfer NFT to buyer
        transaction = await escrow.connect(signer).finalizeSale(home.id);
        await transaction.wait();

        setHasSold(true);

    }



    useEffect( () => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])


    return (
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt="Home"/>
                </div>


                <div className='home__overview'>
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds | 
                        <strong>{home.attributes[3].value}</strong> ba |                         
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>
                    <h2>{home.attributes[0].value} ETH</h2>

                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0,6) + '...' + owner.slice(38,42)}
                        </div>
                    ) : (

                        <div>
                            { (account === inspector) ? (
                                
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>

                            ) : (account === lender) ? (
                                
                                <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                    Approve & Lend
                                </button>
                            
                            ) : (account === seller) ? (
                            
                                <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>

                            ) : (
                                
                                <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>

                            )}

                            <button className='home__contact'>
                                Contact agent
                            </button>                            
                        </div>
                    )}

                    <div>

                    </div>

                    <hr/>

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr/>

                    <h2>Facts & Features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}> <strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>

                </div>

                <button onClick={togglePop} className='home__close'>
                    <img src={close} alt="Close"></img>
                </button>
            </div>
        </div>
    );
}

export default Home;
