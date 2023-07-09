import { genChartByAiUsingPOST } from '@/services/zuobi/chartController';

// import { useModel } from '@umijs/max';
import {Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Spin, Upload} from 'antd';

import { UploadOutlined } from '@ant-design/icons';

import TextArea from 'antd/lib/input/TextArea';
import { useState } from 'react';
// import {any} from "prop-types";
// import e from 'express';
import ReactECharts from 'echarts-for-react';
import React from 'react';

/**
 * 添加图表
 * @constructor
 */

const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BiResponse>();
  const [option, setOption] = useState<any>();
  const [submitting, setsubmitting] = useState<boolean>(false);
  // console.log(JSON.parse('\n' +
  //   '{\n' +
  //   '  "title": {\n' +
  //   '    "text": "网站用户增长情况"\n' +
  //   '  },\n' +
  //   '  "xAxis": {\n' +
  //   '    "type": "category",\n' +
  //   '    "data": ["1号", "2号", "3号"]\n' +
  //   '  },\n' +
  //   '  "yAxis": {\n' +
  //   '    "type": "value"\n' +
  //   '  },\n' +
  //   '  "series": [{\n' +
  //   '    "name": "用户数",\n' +
  //   '    "type": "line",\n' +
  //   '    "data": [10, 50, 70]\n' +
  //   '  }]\n' +
  //   '}\n'))

  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {
    //避免重复提交
    if (submitting) {
      return;
    }
    setsubmitting(true);
    setOption(undefined);
    setChart(undefined);
    //todo 对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try {
      const res = await genChartByAiUsingPOST(params, {}, values.file.file.originFileObj);
      console.log(res);
      if (!res?.data) {
        message.error('分析失败，');
      } else {
        message.success('分析成功');
        const charOption = JSON.parse(res.data.genChart ?? '');
        if (!charOption) {
          throw new Error('图表代码解析错误');
        } else setChart(res.data);
        setOption(charOption);
        // @ts-ignore
        setChart(res.data);
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
    setsubmitting(false);
  };

  return (
    <div className="add-chart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title="智能分析">
            <Form name="addChart" labelAlign="left" labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }} onFinish={onFinish} initialValues={{}}>
              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea placeholder="请输入你的分析需求，比如：详细分析网站用户的增长情况" />
              </Form.Item>

              <Form.Item name="name" label="图表名称">
                <Input placeholder="请输入图表名称" />
              </Form.Item>

              <Form.Item name="charType" label="图表类型">
                <Select
                  options={[
                    { value: '折线图', label: '折线图' },
                    { value: '柱状图', label: '柱状图' },
                    { value: '堆叠图', label: '堆叠图' },
                    { value: '饼图', label: '饼图' },
                    { value: '雷达图', label: '雷达图' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="file" label="原始数据">
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined />}>上传 CSV文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 16, offset: 4 }}>

                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                    提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>

          </Card>

        </Col>
        <Col  span={12}>
          <Card title="分析结论">
            {chart?.genResult ?? <div>请先在左侧进行提交</div>}
            <Spin spinning={submitting}/>
          </Card>
          <Divider />
          <Card title="可视化图表">
            {option ?  <ReactECharts option={option} />:<div>请先在左侧进行提交</div> }
            <Spin spinning={submitting}/>

          </Card>
        </Col>
      </Row>


    </div>
  );
};
export default AddChart;
