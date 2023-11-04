import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import common from "../../util/common";

export default class ExampleOne extends Component {
  constructor(props) {
    super(props);
    this.state = {
        tableHead: ['Category', 'Expected Price'],
      tableData: [
        ["Accomodation", "₹2000"],
        ["Travelling", "₹2000"],
        ["Adventure", "₹2000"],
        ["Food and Outing", "₹2000"],
        ["Extras", "₹2000"],
      ],
    };
  }

  render() {
    const state = this.state;
    return (
      <View style={styles.container}>
        <Table borderStyle={{ borderWidth: 1.5, borderColor: "#fff",borderRadius:10 }}>
          <Row
            data={state.tableHead}
            style={styles.head}
            textStyle={styles.text}
          />
          <Rows data={state.tableData} textStyle={styles.text} />
        </Table>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 0, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: common.color.indicatorPrimary,fontFamily:"Poppins-SemiBold" },
  text: { margin: 6 },
});
