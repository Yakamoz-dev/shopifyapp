import React from "react";
import { connect } from 'react-redux'
import { increment, decrement } from '../src/actions'
import { bindActionCreators } from 'redux'
import { INCREMENT } from '../src/constants'
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  SettingToggle,
  Stack,
  TextField,
  TextStyle,
} from "@shopify/polaris";

class AnnotatedLayout extends React.Component {
  state = {
    discount: "10%",
    enabled: false,
  };

  render() {
    console.log('888',this.props)
    console.log('888-1',this.pageProps)
    const { discount, enabled } = this.state;
    const contentStatus = enabled ? "Disable" : "Enable";
    const textStatus = enabled ? "enabled" : "disabled";

    return (
      <Page>
        <h1>{this.props.value}</h1>
        <Layout>
          <Layout.AnnotatedSection
            title="Default discount"
            description="Add a product to Sample App, it will automatically be discounted."
          >
            <Card sectioned>
              <Form onSubmit={this.handleSubmit}>
                <FormLayout>
                  <TextField
                    value={discount}
                    onChange={this.handleChange("discount")}
                    label="Discount percentage"
                    type="discount"
                  />
                  <Stack distribution="trailing">
                    <Button primary submit>
                      Save
                    </Button>
                  </Stack>
                </FormLayout>
              </Form>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title="Price updates"
            description="Temporarily disable all Sample App price updates"
          >
            <SettingToggle
              action={{
                content: contentStatus,
                onAction: this.handleToggle,
              }}
              enabled={enabled}
            >
              This setting is{" "}
              <TextStyle variation="strong">{textStatus}</TextStyle>.
            </SettingToggle>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    );
  }

  handleSubmit = () => {
    this.setState({
      discount: this.state.discount,
    });
    console.log("submission", this.state);
  };

  handleChange = (field) => {
    return (value) => this.setState({ [field]: value });
  };

  handleToggle = () => {
    this.setState(({ enabled }) => {
      return { enabled: !enabled };
    });
  };
}

AnnotatedLayout.getInitialProps = ({ store,ctx }) => {
  store.dispatch({
    type: INCREMENT,
    from: 'server'
  })

  return {
    pageProps:{
      ...pageProps,
      shopOrigin: ctx.query.shop
    }
  }
}

export default connect(
  state => state,
  dispatch => ({ actions: bindActionCreators({ increment, decrement }, dispatch) })
)(AnnotatedLayout)
