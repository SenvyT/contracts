// Simple test for contract configuration
// Run this in browser console to test

import contractConfig from './contractConfig';

async function testContractConfig() {
  console.log('🧪 Testing Contract Configuration...');
  
  try {
    // Test getting deployment info
    const deploymentInfo = await contractConfig.getDeploymentInfo();
    console.log('✅ Deployment Info:', deploymentInfo);
    
    // Test getting contract address
    const address = await contractConfig.getContractAddress();
    console.log('✅ Contract Address:', address);
    
    // Test getting ABI
    const abi = contractConfig.getContractABI();
    console.log('✅ Contract ABI length:', abi.length);
    
    // Test network config
    const network = contractConfig.getNetworkConfig();
    console.log('✅ Network Config:', network);
    
    // Test deployment status
    const isDeployed = await contractConfig.isContractDeployed();
    console.log('✅ Is Deployed:', isDeployed);
    
    console.log('🎉 All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for use in browser console
window.testContractConfig = testContractConfig;

export default testContractConfig; 