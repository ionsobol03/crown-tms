import { Layout } from "components/common";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import nookies from "nookies";
import { auth } from "utils/firebaseAdmin";
import { BrokerProp, JobProp, LoadProp } from "utils/interfaces";
import { JobsView } from "components/loads/Form";
import {
  Card,
  Breadcrumbs,
  Button,
  Typography,
  Grid,
  makeStyles,
  Theme,
  createStyles,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  CardHeader,
  CardContent,
  ListSubheader,
  Box,
} from "@material-ui/core";
import { useAuth } from "lib";

import { ArrowBack, Delete, Add, ChevronRight } from "@material-ui/icons";
import { DropJobIcon, PickJobIcon } from "components/ui/Icons";
import { Autocomplete } from "@material-ui/lab";
import { isAuthenticated } from "lib/api/Users";
import { getBrokers } from "lib/api/Brokers";

interface Props {
  data: BrokerProp[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      marginTop: theme.spacing(5),
    },
  })
);

const NewLoad: React.FC<Props> = (props) => {
  const { data } = props;
  const [showAddJob, setShowAddJob] = useState(false);
  const [broker, setBroker] = useState<BrokerProp | null>(data[0]);
  const [references, setReferences] = useState<
    { name: string; value: string }[]
  >([]);
  const [isTonu, setIsTonu] = useState(false);
  const [jobs, setJobs] = useState<JobProp[]>([]);
  const [rate, setRate] = useState("");
  const [reference, setReference] = useState({ name: "", value: "" });

  const classes = useStyles();

  const auth = useAuth();

  const handleAddReference = () => {
    if (references.some((item) => item.name === reference.name)) {
      alert("Reference Type Already Exists!");
      return;
    }
    setReferences((prevState) => [...prevState, reference]);
    setReference({ name: "", value: "" });
  };

  const handleRemoveReference = (refName: string) => {
    setReferences((prevState) =>
      prevState.filter((item) => item.name !== refName)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await (
        await fetch("/api/loads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            user: auth.user.id,
          },
          body: JSON.stringify({
            broker: broker.id,
            references,
            isTonu,
            jobs,
            rate: Number(rate),
          }),
        })
      ).json();
      if (data.id) {
        console.log(data.id);
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h2">New Load</Typography>
          <Breadcrumbs separator={<ChevronRight />}>
            <Link href="/">Dashboard</Link>
            <Link href="/loads">Loads</Link>
            <Typography color="textPrimary">New Load</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item>
          <Link href="/loads">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBack />}
            >
              Cancel
            </Button>
          </Link>
        </Grid>
      </Grid>
      <Box className={classes.content}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item md={6}>
              <Card>
                <CardHeader title="Load Info" />
                <Divider className="my-3" />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={9}>
                      <Autocomplete
                        value={broker}
                        options={data}
                        getOptionLabel={(option) =>
                          `${option.name}(${option.dba})`
                        }
                        renderOption={(option) => (
                          <Box>
                            <Typography>{option.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.dba}
                            </Typography>
                          </Box>
                        )}
                        onChange={(e, newValue: BrokerProp | null) =>
                          setBroker(newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Select Broker"
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: "new-password", // disable autocomplete and autofill
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item md={3}>
                      <TextField
                        variant="outlined"
                        label="Rate"
                        name="rate"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        fullWidth
                        className="mb-3"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <List className="mb-3">
                        {!references.length && (
                          <ListItem>
                            <ListItemText
                              primary={
                                <Typography color="error">
                                  No load references
                                </Typography>
                              }
                            />
                          </ListItem>
                        )}
                        {references.map((ref, index) => (
                          <ListItem divider key={index}>
                            <ListItemText
                              primary={`${ref.name}: ${ref.value}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() => handleRemoveReference(ref.name)}
                              >
                                <Delete color="error" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item md={5}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Ref Name"
                        value={reference.name}
                        onChange={(e) =>
                          setReference((prevState) => ({
                            ...prevState,
                            name: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item md={5}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Ref Value"
                        value={reference.value}
                        onChange={(e) =>
                          setReference((prevState) => ({
                            ...prevState,
                            value: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item md={2}>
                      <Button
                        color="primary"
                        onClick={handleAddReference}
                        startIcon={<Add />}
                      >
                        ADD
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Jobs Info"
                  action={
                    <Button
                      aria-label="settings"
                      color="primary"
                      onClick={() => setShowAddJob(true)}
                      startIcon={<Add />}
                    >
                      Add
                    </Button>
                  }
                />

                <Divider />
                <CardContent>
                  <Grid container>
                    <Grid item xs={12}>
                      <FormControlLabel
                        label="Is tonu?"
                        control={
                          <Switch
                            name="isTonu"
                            color="primary"
                            onChange={(e) => setIsTonu(!isTonu)}
                          />
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <List subheader={<ListSubheader>Job List</ListSubheader>}>
                        {jobs
                          .sort((a, b) => {
                            if (a.type === "Pick" && b.type === "Drop") {
                              return -1;
                            } else if (a.type === "Drop" && b.type === "Pick") {
                              return 1;
                            } else {
                              return 0;
                            }
                          })
                          .map((job, index) => (
                            <ListItem key={index} divider>
                              <ListItemIcon>
                                {job.type === "Pick" ? (
                                  <PickJobIcon />
                                ) : (
                                  <DropJobIcon />
                                )}
                              </ListItemIcon>
                              <ListItemText>
                                {job.name}: {job.address.address1},{" "}
                                {job.address.city}, {job.address.state}{" "}
                                {job.address.zipCode}
                              </ListItemText>
                            </ListItem>
                          ))}
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      <JobsView
        onSubmit={(values) => setJobs((prevState) => [...prevState, values])}
        show={showAddJob}
        handleClose={() => setShowAddJob(false)}
      />
    </Layout>
  );
};

export default NewLoad;

export const getServerSideProps: GetServerSideProps = async (ctx) =>
  await isAuthenticated(
    ctx,
    async (data) => ({ props: { data: await getBrokers() } }),
    "/"
  );
