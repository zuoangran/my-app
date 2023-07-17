
import React, {useEffect, useState} from 'react';
import {listMyChartByPageUsingPOST} from "@/services/zuobi/chartController";
import {Avatar, Card, List, message, Result} from "antd";
import ReactECharts from "echarts-for-react";
import {useModel} from "@umijs/max";
import Search from "antd/es/input/Search";

/**
 * 添加图表
 * @constructor
 */

const MyChartPage: React.FC = () => {
  const initSearchParams={
    current: 1,
    pageSize:4,
    sortField:'createTime',
    sortOrder:'desc',
  }

  const [searchParams,setSearchParams]=useState<API.ChartQueryRequest>({...initSearchParams});
  const {initialState}=useModel('@@initialState');
  const {currentUser}=initialState ?? {};
  const [chartList,setChartList]=useState<API.Chart[]>();
  const [total,setTotal]=useState<number>(0);
  const [loading,setLoading]=useState<boolean>(true);
const loadDate= async ()=>{
  setLoading(true);
  try {
    const res = await listMyChartByPageUsingPOST(searchParams);
    if(res.data){
      setChartList(res.data.records ?? []);
      setTotal(res.data.total ?? 0);
      //去掉图标的标题
      if(res.data.records){
        res.data.records.forEach(data=>{
          if(data.status==='succeed'){
          const chartOption=JSON.parse(data.genChart ?? '{}');
          //把标题设为undefined
          chartOption.title=undefined;
          //然后把修改后的数据转化为json设置回去
          data.genChart=JSON.stringify(chartOption);}
        })
      }


    }else {
      message.error("获取我的图表失败")
    }
  } catch (e: any) {
    message.error("获取我的图标失败"+e.message)
  }
  setLoading(false);
}
useEffect(()=>{
  loadDate();
  },[searchParams]);
  return (
    <div className="my-chart-page">
      <div>
        <Search placeholder="请输入图表名称" loading={loading} enterButton onSearch={(value)=>{
          //设置搜索条件
        setSearchParams({
          ...initSearchParams,
          name:value,
        })
        }}/>

        <div className="margin-16"/>


      </div>
      <List
        // itemLayout="vertical"
        grid={  {
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page,pageSize) => {
            setSearchParams({
              ...searchParams,
              current:page,
              pageSize,
            })
            console.log(page);
          },
          current:searchParams.current,
          pageSize: searchParams.pageSize,
          total:total,
        }}
        loading={loading}
        dataSource={chartList}
        // footer={
        //   // <div>
        //   //   <b>ant design</b>RegisterParams
        //   // </div>
        // }
        renderItem={(item) => (
          <List.Item
            key={item.id}
          >
            <Card>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                title={item.name}
                description={item.charType ? ('图表类型: '+item.charType):undefined}
              />
              <>
                {
                      item.status === 'succeed' &&<>
                    <div style={{marginBottom: 16}}/>
                    <p>{"分析目标: "+item.goal}</p>
                    <div style={{marginBottom: 16}}/>
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)}/>

                  </>
                }
                {
                  item.status==='wait'&&<>
                    <Result
                      status="warning"
                      title="待生成"
                      subTitle={item.execMessage ?? '欢迎开通vip,高速生成不排队'}
                    />


                  </>
                }

                {
                  item.status==='running'&&<>
                    <Result
                      status="info"
                      title="图表生成中"
                      subTitle={item.execMessage}
                    />


                  </>
                }
                {
                  item.status==='failed'&&<>
                    <Result
                      status="error"
                      title="图表生成失败"
                      subTitle={item.execMessage}
                      />


                    </>
                }
              </>

            </Card>

          </List.Item>

        )}
      />
      总数：{total}
    </div>
  );
};
export default MyChartPage;
