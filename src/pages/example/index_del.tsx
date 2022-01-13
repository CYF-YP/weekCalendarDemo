/*
 * @Description: 日历组件--废弃
 * @Autor: CYF
 * @Date: 2022-01-11 08:32:50
 * @LastEditors: CYF
 * @LastEditTime: 2022-01-13 16:46:53
 */
import { View, Text, Swiper, SwiperItem } from "@tarojs/components";
import { Component } from 'react'

type PageStateProps = {
  acceptCurrYear: number;
  acceptCurrWeek: number;
};

type PageState = {
  currYear: number,
  currWeek: number;
  currFirstDay: string;
  firstWeekCount: number;
  currWeekCount: number;
  dateList: Array<{ date: Date }>;
  preList: Array<{ date: Date }>;
  lastList: Array<{ date: Date }>;
  currView: number;
};

export default class CalendarCom extends Component<PageStateProps, PageState> {
  static defaultProps = {
    acceptCurrYear: new Date().getFullYear(),
    acceptCurrWeek: 2,
  };
  constructor(props) {
    super(props);
    this.state = {
      currYear: new Date().getFullYear(),
      currWeek: 1, // 当前周
      currFirstDay: '', // 当前周第一天的日期
      firstWeekCount: 0, // 本年第一周的天数
      currWeekCount: 53, // 本年总周数
      dateList: [],
      preList: [],
      lastList: [],
      currView: 1,
    };
    this.setStateP.bind(this);
  }

  UNSAFE_componentWillMount() {
    // 初始化 - 组件render之前调用
    if (this.props.acceptCurrWeek !== null && this.props.acceptCurrWeek !== undefined) {
      // 当前周被传入
      this.setStateP({
        currYear: this.props.acceptCurrYear,
        currWeek: this.props.acceptCurrWeek
      }).then(() => {
        this.setStateP({
          currFirstDay: this.getDate({ year: this.props.acceptCurrYear ?? new Date().getFullYear() })
        });
      }).then(() => {
        this.setStateP({
          dateList: this.getIntactDate(),
        });
      }).then(() => {
        this.setStateP({
          preList: this.getPreList({}),
          lastList: this.getLastList({}),
        });
      }).catch(() => {
      });
    } else {
      this.setStateP({
        currWeek: this.getWeek({}),
      }).then(() => {
        this.setState({
          currFirstDay: this.getDate({}),
        });
      }).then(() => {
        this.setStateP({
          dateList: this.getIntactDate(),
        });
      }).then(() => {
        this.setStateP({
          preList: this.getPreList({}),
          lastList: this.getLastList({}),
        });
      }).catch(() => {
      });
    }
  }

  /**
   * @description: setState改promise
   * @return {*} promise对象
   */
  setStateP(state: any) {
    return new Promise((resolve: (value?: any) => void) => this.setState(state, resolve));
  }

  /**
   * @description: 获取全年总共天数
   * @param {*} year 年份
   * @return {number} 全年总共天数
   */  
  getAllYearDay({ year=new Date().getFullYear() }) {
    if(year % 4 == 0 && year % 100 !=0 || year % 400 == 0){
			return 366;
		}
    return 365;
  }

  /**
   * @description: 获取全年第一周的天数
   * @param {*} year 年份
   * @return {number} 第一周天数
   */  
  getFirstWeekDay({ year=new Date().getFullYear() }) {
    let initTime = new Date(year, 0, 1);
    if (initTime.getDay() === 0) {
      // 1月1日是周日，第一周只有一天
      return 1;
    }
    // 第一周的天数
    return (7 - initTime.getDay() + 1);
  }

  /**
   * @description: 获取全年总周数
   * @param {*} year 年份
   * @return {number} 全年总周数
   */  
  getAllWeek({ year=new Date().getFullYear() }) {
    return (Math.ceil((this.getAllYearDay({year}) - this.getFirstWeekDay({year})) / 7) + 1);
  }

  /**
   * @description: 获取当天是今年的第几周(以周日为起始)
   * @param {*} year 年份
   * @param {*} date 日期
   * @return {number} 当前周是第几周
   */
  getWeek({ year=new Date().getFullYear(), date=new Date() }) {
    let nowDate = date;
    let firstWeekCount = this.getFirstWeekDay({}); // 本年初始周天数
    let initTime = new Date(year, 0, 1);
    // initTime.setMonth(0); // 本年初始月份
    // initTime.setDate(1); // 本年初始时间

    this.setState({
      firstWeekCount: firstWeekCount,
      currWeekCount: this.getAllWeek({}),
    });

    let differenceVal = Number(nowDate) - Number(initTime); // 今天的时间减去本年开始时间，获得相差的时间(valueOf()/getTime()同样可以获得时间戳)
    let todayYear = Math.ceil(differenceVal / (24 * 60 * 60 * 1000)) + 1; // 获取今天是今年第几天

    let index = 1;
    if (nowDate.getMonth() === 0 && nowDate.getDate() <= firstWeekCount) {
      index = 1;
    } else {
      index = Math.ceil((todayYear - firstWeekCount) / 7) + 1; // 获取今天是今年第几周
    }
    return index;
  };

  /**
   * @description: 获取当前周第一天的日期
   * @return {string} 当前周第一天日期
   */
  getDate({ year = new Date().getFullYear() }) {
    if (this.state.currWeek === 1) {
      return new Date(year, 0, 1).toLocaleDateString();
    }
    if (!this.state.firstWeekCount) {
      let firstWeekCount = this.getFirstWeekDay({year}); // 本年初始周天数
      this.setState({
        firstWeekCount: firstWeekCount,
      });
      return new Date(year, 0, (this.state.currWeek - 2) * 7 + 1 + firstWeekCount).toLocaleDateString();
    }
    return new Date(year, 0, (this.state.currWeek - 2) * 7 + 1 + this.state.firstWeekCount).toLocaleDateString();
  }

  /**
   * @description: 获取完整的日期列表
   * @return {Array} 完整日期列表
   */
  getIntactDate() {
    console.log('当前周的第一天是：', this.state.currFirstDay);
    let tmpCurrFirstDay = new Date(this.state.currFirstDay);
    let tmpFirstWeek = tmpCurrFirstDay.getDay(); // 周：0-6
    let tmpFirstDate = tmpCurrFirstDay.getDate(); // 1-31
    let beforeCount = 0, afterCount = 0;
    let intactList: Array<{ date: Date }> = [];
    if (tmpFirstWeek > 4) {
      beforeCount = tmpFirstWeek - 1;
    } else if (tmpFirstWeek === 0) {
      beforeCount = 6;
    } else {
      beforeCount = 7 + tmpFirstWeek - 1;
    }
    afterCount = 21 - beforeCount - 1;

    for (let i = 0; i < beforeCount; i++) {
      let tmpDate = new Date(this.state.currFirstDay);
      tmpDate.setDate(tmpFirstDate - (i + 1));
      intactList.unshift({ date: tmpDate });
    }
    intactList.push({ date: tmpCurrFirstDay });
    for (let i = 0; i < afterCount; i++) {
      let tmpDate = new Date(this.state.currFirstDay);
      tmpDate.setDate(tmpFirstDate + (i + 1));
      intactList.push({ date: tmpDate });
    }
    return intactList;
  }

  /**
   * @description: 获取前一页列表数据
   * @return {Array} 前一页列表数据
   */
  getPreList({ dataList=this.state.dateList }) {
    if (dataList.length) {
      let tmpFirstDay = dataList[0].date;
      let tmpLastDate = tmpFirstDay.getDate();
      let intactList: Array<{ date: Date }> = [];
      for (let i = 0; i < 21; i++) {
        let tmpDate = new Date(tmpFirstDay);
        tmpDate.setDate(tmpLastDate - (i + 1));
        intactList.unshift({ date: tmpDate });
      }
      console.log('前一页：', intactList);
      return intactList;
    }
    return [];
  }

  /**
   * @description: 获取后一页列表数据
   * @return {Array} 后一页列表数据
   */
  getLastList({ dataList=this.state.dateList }) {
    if (dataList.length) {
      let tmpLastDay = dataList[dataList.length - 1].date;
      let tmpLastDate = tmpLastDay.getDate();
      let intactList: Array<{ date: Date }> = [];
      for (let i = 0; i < 21; i++) {
        let tmpDate = new Date(tmpLastDay);
        tmpDate.setDate(tmpLastDate + (i + 1));
        intactList.push({ date: tmpDate });
      }
      console.log('后一页：', intactList);
      return intactList;
    }
    return [];
  }

  onChange(e: any) {
    console.log(e, this.state.currView);
    let currIndex = e.detail.current;
    let dataObj = {};
    let currWeek = this.state.currWeek;
    if ((currIndex > this.state.currView && Math.abs(currIndex - this.state.currView) === 1) || (currIndex < this.state.currView && Math.abs(currIndex - this.state.currView) !== 1)) {
      // 左滑
      switch(currIndex) {
        case 0:
          // 当前是preList，上一页是lastList，下一页是dateList
          dataObj = {
            dateList: this.getLastList({ dataList: this.state.preList }),
          }
          break;
        case 1:
          // 当前是dateList，上一页是preList，下一页是lastList
          dataObj = {
            lastList: this.getLastList({}),
          }
          break;
        case 2:
          // 当前是lastList，上一页是dateList，下一页是preList
          dataObj = {
            preList: this.getLastList({ dataList: this.state.lastList }),
          }
          break;
        default:
          break;
      }
      if (this.state.currWeek + 3 > this.state.currWeekCount) {
        currWeek = this.state.currWeek + 3 - this.state.currWeekCount;
        this.setStateP((preState) => {
          return {
            currYear: preState.currYear + 1,
          }
        })
      } else {
        currWeek = this.state.currWeek + 3;
      }
    } else {
      // 右滑
      switch(currIndex) {
        case 0:
          // 当前是preList，上一页是lastList，下一页是dateList
          dataObj = {
            lastList: this.getPreList({ dataList: this.state.preList }),
          }
          break;
        case 1:
          // 当前是dateList，上一页是preList，下一页是lastList
          dataObj = {
            preList: this.getPreList({}),
          }
          break;
        case 2:
          // 当前是lastList，上一页是dateList，下一页是preList
          dataObj = {
            dateList: this.getPreList({ dataList: this.state.lastList }),
          }
          break;
        default:
          break;
      }
      if (this.state.currWeek - 3 > 0) {
        currWeek = this.state.currWeek - 3
      } else {
        currWeek = this.getAllWeek({year: this.state.currYear - 1}) - ( 3 - this.state.currWeek )
        this.setStateP((preState) => {
          return {
            currYear: preState.currYear - 1,
          }
        })
      }
    }
    this.setStateP({
      ...dataObj,
      currWeek,
      currView: currIndex
    });
  }

  render() {
    return (
      <View>
        <Text style={{
          padding: "10px",
          display: "block",
          textAlign: "center",
          boxSizing: "border-box"
        }}
        >第{this.state.currWeek}周</Text>
        <View>
          {['一', '二', '三', '四', '五', '六', '日'].map((item) => {
            return (
              <Text style={{ display: "inline-block", width: `calc(100% / 7)`, textAlign: "center" }}>{item}</Text>
            );
          })}
        </View>
        <Swiper
          circular
          current={this.state.currView}
          onChange={this.onChange.bind(this)}
        >
          <SwiperItem>
            <View>
              {this.state.preList.map((item) => {
                return (
                  <Text style={{ display: "inline-block", width: `calc(100% / 7)`, textAlign: "center" }}>{item.date.getDate()}</Text>
                );
              })}
            </View>
          </SwiperItem>
          <SwiperItem>
            <View>
              {this.state.dateList.map((item) => {
                return (
                  <Text style={{ display: "inline-block", width: `calc(100% / 7)`, textAlign: "center" }}>{item.date.getDate()}</Text>
                );
              })}
            </View>
          </SwiperItem>
          <SwiperItem>
            <View>
              {this.state.lastList.map((item) => {
                return (
                  <Text style={{ display: "inline-block", width: `calc(100% / 7)`, textAlign: "center" }}>{item.date.getDate()}</Text>
                );
              })}
            </View>
          </SwiperItem>
        </Swiper>
      </View>
    )
  }
}
