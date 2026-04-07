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

function RegisterLand() {
  const { contract, account, isConnected, connectWallet, web3 } = useWeb3();

  const [formData, setFormData] = useState({
    area: '',
    location: '',
    price: '',
    surveyNumber: '',
    propertyId: '',
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
      // Convert price from ETH string to wei using web3.utils.toWei
      const priceInWei = web3
        ? web3.utils.toWei(formData.price.toString(), 'ether')
        : '0';

      await contract.methods
        .registerProperty(
          formData.propertyId,
          formData.surveyNumber,
          formData.location,
          parseInt(formData.area, 10),
          priceInWei
        )
        .send({ from: account });

      setNotification({
        open: true,
        message: `✅ Property "${formData.propertyId}" registered on the blockchain!`,
        severity: 'success',
      });
      // Reset form
      setFormData({ area: '', location: '', price: '', surveyNumber: '', propertyId: '' });
    } catch (error) {
      console.error('[RegisterLand] Transaction error:', error);
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
          Register Land Property
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
              Connect your MetaMask wallet to register properties on the blockchain.
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
            <Grid item xs={12} sm={6}>
              <TextField
                name="propertyId"
                label="Property ID"
                fullWidth
                required
                value={formData.propertyId}
                onChange={handleChange}
                helperText='E.g. "PROP101"'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="surveyNumber"
                label="Survey Number"
                fullWidth
                required
                value={formData.surveyNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Property Location"
                fullWidth
                required
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="area"
                label="Area (in sq. ft.)"
                type="number"
                fullWidth
                required
                value={formData.area}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price (in ETH)"
                type="number"
                inputProps={{ step: '0.0001' }}
                fullWidth
                required
                value={formData.price}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? 'Waiting for MetaMask confirmation…' : isConnected ? 'Register Property on Blockchain' : 'Connect Wallet to Register'}
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

export default RegisterLand;
