import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { useAccount } from 'wagmi';

const ConnectButton = () => {
  const { address} = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <button onClick={openConnectModal}>
      Connect Wallet {address}
    </button>
  );
};

export default ConnectButton;