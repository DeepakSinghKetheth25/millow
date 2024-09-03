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

  const [account, setAccount] = useState(null)

  const loadBlockchainData = async () => {

    //Ether provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log(provider);


    //If user updates the account on metamask, this method will automatically update the account
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

  return (
    <div>

      <Navigation account={account} setAccount={setAccount}/>

      <div className='cards__section'>

        <h3>Welcome to Millow</h3>

      </div>

    </div>
  );
}

export default App;
