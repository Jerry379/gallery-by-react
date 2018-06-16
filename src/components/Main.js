require('normalize.css/normalize.css');
require('styles/App.scss');


import React from 'react';

//获取图片相关的数据，将图片名信息转成图片URL路径信息
let imageDatas = require('../data/imageDatas.json');
function getImageURL(imageDatasArr) {
  for (let i = 0,j = imageDatasArr.length;i<j;i++){
    let singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/'+singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
}
imageDatas = getImageURL(imageDatas);

//控制组件
class ControllerUnit extends React.Component{
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e){
    //如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  }
  render() {
    let controlelrUnitClassName = 'controller-unit';
    //如果对应的是居中的图片，显示控制按钮的居中态
    if(this.props.arrange.isCenter){
      controlelrUnitClassName += ' is-center';

      //如果同时对应的是翻转图片，显示控制按钮的翻转态
      if(this.props.arrange.isInverse){
        controlelrUnitClassName += ' is-inverse';
      }
    }
    return (
      <span className={controlelrUnitClassName} onClick={this.handleClick}></span>
    )
  }
}

class ImgFigure extends React.Component{
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e){
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }



  render(){
    let styleObj = {};
    //如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }
    //如果图片的旋转角度有值并且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['MozTransform','msTransform','WebkitTransform','transform']).forEach(function (value) {
          styleObj[value] = 'rotate('+this.props.arrange.rotate+'deg)';
      }.bind(this));
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }

    let imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse': '';

    return (
      <figure onClick={this.handleClick} className={imgFigureClassName} style={styleObj} ref='figure'>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back"  onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    )
  }
}











class AppComponent extends React.Component {
  constructor(){
    super();
    this.Constant = {
      centerPos:{
        left:0,
        right:0
      },
      hPosRange:{//水平方向的取值范围
        leftSecX:[0,0],
        rightSecX:[0,0],
        y:[0,0]
      },
      vPosRange:{//垂直方向的取值范围
        x:[0,0],
        topY:[0,0]
      }
    };
    /**
     * 翻转图片
     *
     * @param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
     * @return {Function} 这是一个闭包函数，其中return一个真正待被执行的函数
     */
    this.inverse = function (index) {

      return function(){
        let imgsArrangeArr = this.state.imgsArrangeArr;
        imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
        this.setState({
          imgsArrangeArr : imgsArrangeArr
        })
      }.bind(this);
    };
    this.imgsArrangeArr = [{
      pos:{
        left:'0',
        top:'0'
      },
      rotate:0,
      isInverse:false,//图片的正反面
      isCenter:false//图片是否居中
    }];
  }


  componentDidMount(){
    //拿到舞台的大小
    let stageW = this.refs.stage.scrollWidth;
    let stageH = this.refs.stage.scrollHeight;
    let halfStageW = Math.ceil(stageW/2);
    let halfStageH = Math.ceil(stageH/2);

    //拿到一个imgFigures的大小
    let imgFigureDOM = this.refs.imgFigures0.refs.figure;//教程里面是this.refs.imgFigures0.但是这样取不到宽高，通过在imgFigures组件中添加ref，然后这样获取，才可以。
    let imgW = imgFigureDOM.scrollWidth;
    let imgH = imgFigureDOM.scrollHeight;
    // let imgW = 320;
    // let imgH = 360;
    let halfImgW = Math.ceil(imgW/2);
    let halfImgH = Math.ceil(imgH/2);

    //计算中心图片的位置点
    this.Constant.centerPos = {
      left:halfStageW-halfImgW,
      top:halfStageH-halfImgH
    };

    //计算左侧右侧区域图片排布位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW + halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH -halfImgH;

    //计算上册图片排布位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  }

  /**
   * 获取区间内的一个随机值
   */
  getRangeRandom(low,high){
     return Math.ceil(Math.random() * (high - low) + low);
  }

  /**
   * 获取0到30度之间的任意正负值
   *
   * 首先，取一个随机数，如果大于0.5就是取的正的角度，小于就是取的负的角度
   *
   */
  get30DegRandom(){
    return (Math.random() > 0.5? '' : '-') +Math.ceil(Math.random()*30)
  }
  /**
   * 重新布局所有图片
   * @param centerIndex 指定居中排布哪个图片
   */
  rearrange(centerIndex){
    let imgsArrangeArr = this.imgsArrangeArr;
    let Constant = this.Constant;
    let centerPos = Constant.centerPos;
    let hPosRange = Constant.hPosRange;
    let vPosRange = Constant.vPosRange;
    let hPosRangeLeftSetX = hPosRange.leftSecX;
    let hPosRangeRightSetx = hPosRange.rightSecX;
    let hPosRangeY = hPosRange.y;
    let vPosRangeTopY = vPosRange.topY;
    let vPosRangeX = vPosRange.x;

    let imgsArrangeTopArr = [];
    let topImgNum = Math.floor(Math.random()*2);//取一个或者不取
    let topImgSpliceIndex = 0;

    let imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

    imgsArrangeCenterArr[0] ={
      pos:centerPos,
      rotate:0,
      isCenter:true
    };

    //取出要布局上册的图片的状态信息
    topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

    //布局位于上部的图片
    imgsArrangeTopArr.forEach(function (ele,i) {
      imgsArrangeTopArr[i] = {
          pos : {
            top: this.getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
            left: this.getRangeRandom(vPosRangeX[0], vPosRangeX[1])
          },rotate:this.get30DegRandom(),
          isCenter:false
        }
    }.bind(this));

    //布局两侧的图片
    for (let i = 0,j = imgsArrangeArr.length,k = j/2;i<j;i++){
      let hPosRangeLORX = null;

      //前半部分布局左边
      if(i < k){
        hPosRangeLORX = hPosRangeLeftSetX;
      //右半部分布局右边
      }else{
        hPosRangeLORX = hPosRangeRightSetx;
      }
      imgsArrangeArr[i]={
        pos :{
          top:this.getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left: this.getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
        },rotate:this.get30DegRandom(),
        isCenter:false
      }
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0])
    }

    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr:imgsArrangeArr
    })


  }

  /**
   * 利用rearrange函数，居中对应index的图片
   * @param index 需要悲剧中的图片对应的图片信息数组的index值
   * @return {Function}
   */
  center(index){
    return function () {
      this.rearrange(index);
    }.bind(this);
  }

  render() {
    let controllerUnits=[],imgFigures=[];
    // let that = this;

    //使用bind可以使react.Component对象传入forEach中，如果不使用bind可以在外部生命that = this变量
    imageDatas.forEach(function (value,i) {
      if(!this.imgsArrangeArr[i]){
        this.imgsArrangeArr[i] = {
          pos:{
            left:'0',
            top:'0'
          }, rotate:0,
          isInverse:false,
          isCenter:false
        }
      }
      imgFigures.push(
        <ImgFigure
          arrange={this.imgsArrangeArr[i]}
          key={i}
          data={value}
          ref={'imgFigures'+i}
          inverse={this.inverse(i)}
          center={this.center(i)}
        />);
      controllerUnits.push(
        <ControllerUnit
          key={i}
          arrange={this.imgsArrangeArr[i]}
          inverse={this.inverse(i)}
          center={this.center(i)}
        />);
    }.bind(this));
    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
