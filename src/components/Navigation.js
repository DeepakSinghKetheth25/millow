import logo from '../assets/logo.svg';

const Navigation = ({ account, setAccount }) => {


    // Gets the accounts from the ethereum provider & saves the first account into function state
    // Setting the state in child component will automatically save the state in parent component
    // Hence once the account is connected, it will show the account address instead of 'Connect' button
    const connectHandler = async () => {
        
        //Get Metamask accounts
        const accounts = await window.ethereum.request({ method : 'eth_requestAccounts'});
        // console.log(accounts);

        setAccount(accounts[0]); //Sets account to the state
        // console.log(account) //Gets account from the state
    }  


    return (
        <nav>
            <ul className='nav__links'>
                <li><a href='#'>Buy</a></li>
                <li><a href='#'>Rent</a></li>
                <li><a href='#'>Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt='Logo'></img>
                <h1>Millow</h1>
            </div>
        

            {/* If account exists, it will slice account address & show it
            If it doesn't exist, it will show connect button.
            When connect button is clicked, it will call connectHandler method */}

            {account ? (
                <button
                    type='button'
                    className='nav__connect'
                >
                    {account.slice(0,6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    type='button'
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    Connect
                </button>
            )}
        </nav>
    )
}

export default Navigation;
