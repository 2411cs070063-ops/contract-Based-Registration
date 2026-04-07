import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  styled,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWeb3 } from '../context/Web3Context';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const StyledFormControl = styled(FormControl)({
  width: '100%',
});

function TransferLand() {
  const { contract, account, isConnected, connectWallet, web3 } = useWeb3();

  const [formData, setFormData] = useState({
    propertyId: '',
    newOwnerAddress: '',
    transferAmount: '',
    transferType: 'sale',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setLoading(true);
    try {
      // Price in wei — only relevant for "sale" transfers
      const priceInWei =
        formData.transferType === 'sale' && formData.transferAmount && web3
          ? web3.utils.toWei(formData.transferAmount.toString(), 'ether')
          : '0';

      await contract.methods
        .transferProperty(
          formData.propertyId,
          formData.newOwnerAddress,
          formData.transferType,
          priceInWei
        )
        .send({ from: account });

      setNotification({
        open: true,
        message: `✅ Property "${formData.propertyId}" successfully transferred to ${formData.newOwnerAddress.slice(0, 8)}…`,
        severity: 'success',
      });
      setFormData({ propertyId: '', newOwnerAddress: '', transferAmount: '', transferType: 'sale' });
    } catch (error) {
      console.error('[TransferLand] Transaction error:', error);
      setNotification({
        open: true,
        message: '❌ Error: ' + (error.message || 'Transaction failed. Check MetaMask.'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <StyledContainer maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Transfer Land Ownership
        </Typography>

        {/* Wallet status banner */}
        {!isConnected && (
          <Box
            sx={{
              mt: 2,
              mb: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(25,118,210,0.07)',
              border: '1px solid rgba(25,118,210,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <AccountBalanceWalletIcon color="primary" />
            <Typography variant="body2" color="primary">
              Connect your wallet to initiate property transfers.
            </Typography>
            <Button size="small" variant="contained" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </Box>
        )}

        {isConnected && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              🟢 Connected: <strong>{account}</strong>
            </Typography>
          </Box>
        )}

        <StyledForm onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="propertyId"
                label="Property ID"
                fullWidth
                required
                value={formData.propertyId}
                onChange={handleChange}
                helperText="Must match a property you registered"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="newOwnerAddress"
                label="New Owner's Wallet Address"
                fullWidth
                required
                value={formData.newOwnerAddress}
                onChange={handleChange}
                helperText="The recipient's full Ethereum address (0x…)"
              />
            </Grid>
            <Grid item xs={12}>
              <StyledFormControl>
                <InputLabel>Transfer Type</InputLabel>
                <Select
                  name="transferType"
                  value={formData.transferType}
                  onChange={handleChange}
                  required
                  label="Transfer Type"
                >
                  <MenuItem value="sale">Sale</MenuItem>
                  <MenuItem value="gift">Gift</MenuItem>
                  <MenuItem value="inheritance">Inheritance</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>
            {formData.transferType === 'sale' && (
              <Grid item xs={12}>
                <TextField
                  name="transferAmount"
                  label="Sale Amount (in ETH)"
                  type="number"
                  inputProps={{ step: '0.0001' }}
                  fullWidth
                  required
                  value={formData.transferAmount}
                  onChange={handleChange}
                />
              </Grid>
            )}
          </Grid>
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading
              ? 'Waiting for MetaMask confirmation…'
              : isConnected
              ? 'Initiate Transfer on Blockchain'
              : 'Connect Wallet to Transfer'}
          </SubmitButton>
        </StyledForm>
      </StyledPaper>
      <Snackbar
        open={notification.open}
        autoHideDuration={8000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
}

export default TransferLand;
