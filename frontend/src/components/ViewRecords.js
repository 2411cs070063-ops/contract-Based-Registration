import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  styled,
  CircularProgress,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useWeb3 } from '../context/Web3Context';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
}));

const SearchSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SearchButton = styled(Button)({
  height: '100%',
});

const PropertyCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const OwnershipHistory = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

/** Convert a wei string to ETH with 4 decimal places */
const weiToEth = (wei) => {
  try {
    // Use parseFloat to avoid BigInt ESLint issues
    return (parseFloat(wei) / 1e18).toFixed(4);
  } catch {
    return '0';
  }
};

/** Convert a Unix timestamp (seconds) to a readable date string */
const tsToDate = (ts) => {
  if (!ts || ts === '0') return '—';
  return new Date(Number(ts) * 1000).toLocaleString();
};

function ViewRecords() {
  const { contract, isConnected } = useWeb3();

  const [searchQuery, setSearchQuery] = useState('');
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setError(null);
    setPropertyDetails(null);
    setSearching(true);

    try {
      if (!isConnected || !contract) {
        setError('Please connect your MetaMask wallet first to query the blockchain.');
        setSearching(false);
        return;
      }

      // ── 1. Fetch property details ──────────────────────────────────────────
      const result = await contract.methods.getProperty(searchQuery.trim()).call();
      // result: { surveyNumber, location, area, price, owner }

      // ── 2. Fetch ownership history ─────────────────────────────────────────
      const length = await contract.methods
        .getOwnershipHistoryLength(searchQuery.trim())
        .call();

      const historyPromises = [];
      for (let i = 0; i < Number(length); i++) {
        historyPromises.push(
          contract.methods.getOwnershipHistoryAt(searchQuery.trim(), i).call()
        );
      }
      const historyRaw = await Promise.all(historyPromises);

      const ownershipHistory = historyRaw.map((r) => ({
        from: r.from,
        to: r.to,
        price: weiToEth(r.price),
        transferType: r.transferType,
        timestamp: tsToDate(r.timestamp),
      }));

      setPropertyDetails({
        propertyId: searchQuery.trim(),
        surveyNumber: result.surveyNumber,
        location: result.location,
        area: result.area.toString(),
        currentPrice: weiToEth(result.price),
        currentOwner: result.owner,
        ownershipHistory,
      });
    } catch (err) {
      console.error('[ViewRecords] Search error:', err);
      setError(
        err.message?.includes('Property not found')
          ? `No property found with ID "${searchQuery}".`
          : 'Error fetching data: ' + err.message
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <StyledContainer maxWidth="lg">
      <StyledPaper>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          View Land Records
        </Typography>

        {!isConnected && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Connect your MetaMask wallet (via the Navbar button) to search live blockchain records.
          </Alert>
        )}

        <SearchSection>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <TextField
                fullWidth
                label="Search by Property ID (e.g. PROP101)"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={2}>
              <SearchButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={searching}
                startIcon={searching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
              >
                {searching ? '…' : 'Search'}
              </SearchButton>
            </Grid>
          </Grid>
        </SearchSection>

        {error && (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {propertyDetails && (
          <>
            <PropertyCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Property Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Property ID:</strong> {propertyDetails.propertyId}</Typography>
                    <Typography><strong>Survey Number:</strong> {propertyDetails.surveyNumber}</Typography>
                    <Typography><strong>Location:</strong> {propertyDetails.location}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Area:</strong> {propertyDetails.area} sq ft</Typography>
                    <Typography><strong>Current Price:</strong> {propertyDetails.currentPrice} ETH</Typography>
                    <Typography>
                      <strong>Current Owner: </strong>
                      <Chip
                        label={`${propertyDetails.currentOwner.slice(0, 8)}…${propertyDetails.currentOwner.slice(-6)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 0.5 }}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </PropertyCard>

            <OwnershipHistory>
              <Typography variant="h6" gutterBottom>
                Ownership History ({propertyDetails.ownershipHistory.length} record{propertyDetails.ownershipHistory.length !== 1 ? 's' : ''})
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>From</strong></TableCell>
                      <TableCell><strong>To</strong></TableCell>
                      <TableCell><strong>Price (ETH)</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {propertyDetails.ownershipHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.timestamp}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {record.from === '0x0000000000000000000000000000000000000000'
                            ? '(registered)'
                            : `${record.from.slice(0, 6)}…${record.from.slice(-4)}`}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {`${record.to.slice(0, 6)}…${record.to.slice(-4)}`}
                        </TableCell>
                        <TableCell>{record.price}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.transferType}
                            size="small"
                            color={
                              record.transferType === 'registration'
                                ? 'success'
                                : record.transferType === 'sale'
                                ? 'primary'
                                : 'default'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </OwnershipHistory>
          </>
        )}
      </StyledPaper>
    </StyledContainer>
  );
}

export default ViewRecords;
