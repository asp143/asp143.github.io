import React from "react";
import Page from "../components/Page";
import Typography from "@material-ui/core/Typography";
import withRoot from "../utils/withRoot";

class NotFoundPage extends React.Component {
  render() {
    return (
      <Page title="Not Found">
        <Typography
          paragraph
          color="primary"
          gutterBottom
          variant="h3"
          component="span"
        >
          Hey! You just hit a page that doesn't exist.
        </Typography>
      </Page>
    );
  }
}

export default withRoot(NotFoundPage);
