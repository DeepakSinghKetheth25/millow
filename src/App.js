import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {

  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);
  const [homes, setHomes] = useState([]);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);

  const homesList = [
    {
    "name": "Luxury NYC Penthouse",
    "address": "157 W 57th St APT 49B, New York, NY 10019",
    "description": "Luxury Penthouse located in the heart of NYC",
    "image": "https://drive.google.com/uc?export=view&id=1GXpSgzjVuDGxQU0EADpKMg27PJ5Cyh_m",
    "id": "1",
    "attributes": [
        {
            "trait_type": "Purchase Price",
            "value": 20
        },
        {
            "trait_type": "Type of Residence",
            "value": "Condo"
        },
        {
            "trait_type": "Bed Rooms",
            "value": 2
        },
        {
            "trait_type": "Bathrooms",
            "value": 3
        },
        {
            "trait_type": "Square Feet",
            "value": 2200
        },
        {
            "trait_type": "Year Built",
            "value": 2013
        }
    ]
  },
  
  {
    "name": "Architectural CA Modern Home",
    "address": "70780 Tamarisk Ln, Rancho Mirage, CA 92270",
    "description": "Beautiful modern home in Rancho Mirage",
    "image": "https://drive.google.com/uc?export=view&id=1qie3uc-OwmR-l4gdkWpp3ICcSK1rSYV9",
    "id": "2",
    "attributes": [
        {
            "trait_type": "Purchase Price",
            "value": 15
        },
        {
            "trait_type": "Type of Residence",
            "value": "Single family residence"
        },
        {
            "trait_type": "Bed Rooms",
            "value": 4
        },
        {
            "trait_type": "Bathrooms",
            "value": 4
        },
        {
            "trait_type": "Square Feet",
            "value": 3979
        },
        {
            "trait_type": "Year Built",
            "value": 1980
        }
    ]
  },
  
  {
  "name": "WA Nature Home",
  "address": "183 Woodland Drive, Camano Island, WA 98282",
  "description": "Comfy island home on Camano Island",
  "image": "https://drive.google.com/uc?export=view&id=1ZGoQdE6q1soCpl1031cqax_EUkxQ90tZ",
  "id": "3",
  "attributes": [
      {
          "trait_type": "Purchase Price",
          "value": 10
      },
      {
          "trait_type": "Type of Residence",
          "value": "Single family residence"
      },
      {
          "trait_type": "Bed Rooms",
          "value": 3
      },
      {
          "trait_type": "Bathrooms",
          "value": 3
      },
      {
          "trait_type": "Square Feet",
          "value": 2202
      },
      {
          "trait_type": "Year Built",
          "value": 2020
      }
  ]
}];


  const loadBlockchainData = async () => {

    //1.Ether provider
    //  Set provider into the state
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    //2. Gets Ethereum network ID
    const network = await provider.getNetwork();
    
    //3.1 Picks contracts from config.json based on networkID
    const realEstateAddress = config[network.chainId].realEstate.address;
    const escrowAddress = config[network.chainId].escrow.address;
    // console.log(realEstateAddress)
    // console.log(escrowAddress)

    //3.2 Gets the javascript version of the RealEstate contract
    const realEstate = new ethers.Contract(realEstateAddress, RealEstate, provider);

    //3.2.1 Get properties
    const totalSupply = await realEstate.totalSupply();
    // console.log(totalSupply.toString())
    const homes = [];

    for ( var i=1; i<=totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      // console.log(uri);
      // const response = await fetch(uri);
      // const metadata = await response.json();
      // homes.push(metadata);
      // homes.push(1);

      homes.push(homesList[i-1]);
    }

    setHomes(homes);
    // console.log(homes);

    //3.3 Gets the javascript version of the EscrowAddress contract
    const escrow = new ethers.Contract(escrowAddress, Escrow, provider);
    setEscrow(escrow);

    //4. Accounts - If user updates the account on metamask, this method will automatically update the account
    //address in the state & ultimately on the UI too.
    window.ethereum.on('accountsChanged', async () => {
      console.log('Hey');
      const accounts = await window.ethereum.request({method : 'eth_requestAccounts'});
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    })
  }  

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    // console.log(home);
    setHome(home);
    toggle ? setToggle(false) : setToggle(true)
  }


  return (
    <div>

      <Navigation account={account} setAccount={setAccount}/>

      <Search/>

      <div className='cards__section'>

        <h3>Homes For You</h3>

        <hr/>

        <div className='cards'>

          {homes.map((home, index) => (

            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt='Home'></img>
              </div>

              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong>bds |
                  <strong>{home.attributes[3].value}</strong>ba |
                  <strong>{home.attributes[4].value}</strong>sqft |
                </p>
                <p>{home.address}</p>
              </div>
            </div>

          ))}

        </div>
      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;
