import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import common from "../../util/common";

export default class ExampleOne extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHead: ["Category", "Expected Price"],
      tableData: [
        ["Accomodation", "$3500"],
        ["Travelling", "$4200"],
        ["Adventure", "$2800"],
        ["Food and Outing", "$2900"],
        ["Extras", "$4000"],
      ],
    };
  }

  render() {
    const state = this.state;
    return (
      <View style={styles.container}>
        <Table>
          <Rows data={state.tableData} textStyle={styles.text} />
        </Table>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft:17
  },
  text: { margin: 6, fontFamily: common.text.poppinsMedium },
});
