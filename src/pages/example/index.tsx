/*
 * @Description: 周日历
 * @Autor: CYF
 * @Date: 2022-01-13 08:09:50
 * @LastEditors: CYF
 * @LastEditTime: 2022-01-13 17:49:23
 */
import { View, Text, Swiper, SwiperItem } from "@tarojs/components";
import { Component } from "react";
import moment from 'moment'

type PageStateProps = {
  acceptCurrYear: number;
  acceptCurrWeek: number;
};

type PageState = {
  currYear: number; // 当前年
  currWeek: number; // 当前周
  currFirstDay: string; // 当前周的第一天
  dateList: Array<Array<{ date: Date }>>;
  currView: number;
};

export default class CalendarCom extends Component<PageStateProps, PageState> {
  static defaultProps = {
    acceptCurrYear: new Date().getFullYear(), // 年
    acceptCurrWeek: 3, // 周
  };
  constructor(props) {
    super(props);
    this.state = {
      currYear: new Date().getFullYear(), // 当前年
      currWeek: 1, // 当前周
      currFirstDay: new Date().getFullYear() + "/01/01", // 当前周的第一天
      dateList: [],
      currView: 1,
    };
    this.setStateP.bind(this);
  }

  UNSAFE_componentWillMount() {
    // 初始化 - 组件render之前调用
    this.setStateP({
      currYear: this.props.acceptCurrYear,
      currWeek: this.props.acceptCurrWeek,
    }).then(() => {
      this.setStateP({
        currFirstDay: moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'),
      });
    }).then(() => {
      let tmpDateLits = new Array(5);
      for (let i = 0; i < 5; i++) {
        let tmpDate = new Date(this.state.currFirstDay);
        tmpDate.setDate(tmpDate.getDate() + (i * 7 - 14));
        tmpDateLits[i] = this.getCurrDate({
          firstDay: tmpDate.toLocaleDateString(),
        });
      }
      this.setStateP({
        dateList: tmpDateLits,
      });
    }).catch(() => { });
  }

  /**
   * @description: setState改promise
   * @return {*} promise对象
   */
  setStateP(state: any) {
    return new Promise((resolve: (value?: any) => void) =>
      this.setState(state, resolve)
    );
  }

  /**
   * @description: 获取当前周的日期列表
   * @return {Array} 当前周的日期列表
   */
  getCurrDate({ firstDay = this.state.currFirstDay }) {
    let tmpCurrFirstDay = moment(new Date(firstDay)).startOf('isoWeek').format('YYYY-MM-DD');
    console.log("当前周的第一天是：", tmpCurrFirstDay);
    let intactList: Array<{ date: Date }> = [];
    for (let i = 0; i < 7; i++) {
      let tmpDate = new Date(tmpCurrFirstDay);
      tmpDate.setDate(tmpDate.getDate() + i);
      intactList.push({ date: tmpDate });
    }
    return intactList;
  }

  /**
   * @description: 更新列表
   * @param {number} index 需要更新的index
   * @param {number} slideType 滑动方式 0：上滑 1：下滑
   * @return {*}
   */
  updatDate(index: number, slideType: number) {
    let tmpDataList = [...this.state.dateList];
    let tmpFirstDay = null;
    if (slideType) {
      tmpFirstDay = moment(this.state.currFirstDay).subtract(14, 'days').format('YYYY-MM-DD');
    } else {
      tmpFirstDay = moment(this.state.currFirstDay).add(14, 'days').format('YYYY-MM-DD');
    }
    tmpDataList[index] = this.getCurrDate({ firstDay: tmpFirstDay });
    console.log(tmpDataList[index]);
    this.setStateP({
      dataList: [...tmpFirstDay],
    });
  }

  onChange(e: any) {
    console.log(e);
    let currIndex = e.detail.current;
    if ((currIndex > this.state.currView && Math.abs(currIndex - this.state.currView) === 1) || (currIndex < this.state.currView && Math.abs(currIndex - this.state.currView) !== 1)) {
      // 上滑
      let tmpLastDay = moment(this.state.currFirstDay).add(13, 'days');
      if (tmpLastDay.year() > this.state.currYear) {
        this.setStateP({
          currYear: tmpLastDay.year(),
          currWeek: 1
        }).then(() => {
          console.log('滑动-当前周的第一天：', moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'));
          this.setStateP({
            currFirstDay: moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'),
          });
        }).then(() => {
          let updateIndex = currIndex + 1 + 2 > 4 ? currIndex + 1 + 2 - 4 - 1 : currIndex + 1 + 2; // 需要被更新的dataList的index(swiper显示的当前比实际当前周要小1)
          console.log('被更新的index：', updateIndex);
          this.updatDate(updateIndex, 0);
        }).catch(() => { });
      } else {
        this.setStateP((preState) => {
          return {
            currWeek: preState.currWeek + 1
          }
        }).then(() => {
          console.log('滑动-当前周的第一天：', moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'));
          this.setStateP({
            currFirstDay: moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'),
          });
        }).then(() => {
          let updateIndex = currIndex + 1 + 2 > 4 ? currIndex + 1 + 2 - 4 - 1 : currIndex + 1 + 2; // 需要被更新的dataList的index(swiper显示的当前比实际当前周要小1)
          console.log('被更新的index：', updateIndex);
          this.updatDate(updateIndex, 0);
        }).catch(() => { });
      }
    } else {
      // 下滑
      let tmpFirstDay = moment(this.state.currFirstDay).subtract(7, 'days');
      if (tmpFirstDay.year() < this.state.currYear) {
        this.setStateP({
          currYear: tmpFirstDay.year(),
          currWeek: tmpFirstDay.isoWeek(),
        }).then(() => {
          console.log('滑动-当前周的第一天：', moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'));
          this.setStateP({
            currFirstDay: moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'),
          });
        }).then(() => {
          let updateIndex = currIndex + 1 - 2 < 0 ? currIndex + 1 - 2 + 4 + 1: currIndex + 1 - 2; // 需要被更新的dataList的index
          console.log('被更新的index：', updateIndex);
          this.updatDate(updateIndex, 1);
        }).catch(() => { });
      } else {
        this.setStateP((preState) => {
          return {
            currWeek: preState.currWeek - 1
          }
        }).then(() => {
          console.log('滑动-当前周的第一天：', moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'));
          this.setStateP({
            currFirstDay: moment().year(this.state.currYear).isoWeek(this.state.currWeek).startOf('isoWeek').format('YYYY-MM-DD'),
          });
        }).then(() => {
          let updateIndex = currIndex + 1 - 2 < 0 ? currIndex + 1 - 2 + 4 + 1 : currIndex + 1 - 2; // 需要被更新的dataList的index
          console.log('被更新的index：', updateIndex);
          this.updatDate(updateIndex, 1);
        }).catch(() => {});
      }
    }
    this.setStateP({
      currView: currIndex,
    })
  }

  render() {
    return (
      <View>
        <Text
          style={{
            padding: "10px",
            display: "block",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          第{this.state.currWeek}周
        </Text>
        <View>
          {["一", "二", "三", "四", "五", "六", "日"].map((item) => {
            return (
              <Text
                style={{
                  display: "inline-block",
                  width: `calc(100% / 7)`,
                  textAlign: "center",
                }}
                key={item}
              >
                {item}
              </Text>
            );
          })}
        </View>
        <Swiper
          vertical
          circular
          current={1}
          displayMultipleItems={3}
          onChange={this.onChange.bind(this)}
        >
          {this.state.dateList.map((item, index) => {
            return (
              <SwiperItem key={index}>
                <View>
                  {item.map((data) => {
                    return (
                      <Text
                        style={{
                          display: "inline-block",
                          width: `calc(100% / 7)`,
                          textAlign: "center",
                        }}
                        key={data.date.getDate()}
                      >
                        {data.date.getDate()}
                      </Text>
                    );
                  })}
                </View>
              </SwiperItem>
            );
          })}
        </Swiper>
      </View>
    );
  }
}
