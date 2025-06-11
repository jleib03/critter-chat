import { Box, Button, Container, Grid, Typography, styled } from "@mui/material"

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
  color: theme.palette.common.white,
  textAlign: "center",
}))

const FeatureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  textAlign: "center",
}))

const FeatureItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
}))

const LandingPage = () => {
  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to CritterCare
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Your one-stop solution for managing your pet's health and well-being.
          </Typography>
          <Button variant="contained" color="primary">
            Get Started
          </Button>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <FeatureSection>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom>
            Key Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureItem>
                <Typography variant="h6">Health Records</Typography>
                <Typography variant="body2">
                  Keep track of your pet's vaccinations, medications, and medical history.
                </Typography>
              </FeatureItem>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureItem>
                <Typography variant="h6">Appointment Scheduling</Typography>
                <Typography variant="body2">Easily schedule appointments with your veterinarian.</Typography>
              </FeatureItem>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureItem>
                <Typography variant="h6">Medication Reminders</Typography>
                <Typography variant="body2">Receive reminders for your pet's medications.</Typography>
              </FeatureItem>
            </Grid>
          </Grid>
        </Container>
      </FeatureSection>
    </Box>
  )
}

export default LandingPage
