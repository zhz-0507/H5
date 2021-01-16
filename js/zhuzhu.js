+(function(w){
    w.zhuzhu = {}
    w.zhuzhu.css = function(node,type,val){
        if(typeof node ==="object" && typeof node["transform"] === "undefined"){
            node["transform"] = {}
        }
    
        if(arguments.length>=3){
            // 设置
            var text = ""
			node["transform"][type] = val

            for(item in node["transform"]){
                if(node["transform"].hasOwnProperty(item)){
                    switch(item){
                        case "translateX":
                        case "translateY":
                        case "translateZ":
                            text += item+"("+node["transform"][item]+"px)"
                            break
                        case "scale":
                            text += item+"("+node["transform"][item]+")"
                            break
                        case "rotate":
                            text +=  item+"("+node["transform"][item]+"deg)"
                            break
                    }
                }
            }
    
            node.style.transform = node.style.webkitTransform = text
        }else if(arguments.length==2){
            // 读取
            val = node["transform"][type]
            if(typeof val === "undefined"){
                switch (type){
                    case "translateX":
                    case "translateY":
                    case "rotate":
                        val =0
                        break
                    case "scale":
                        val =1
                        break
                }
            }
            return val
        }
    }
    w.zhuzhu.carousel = function(arr){

        //布局
        var carouselWrap = document.querySelector(".carousel-wrap");
        if(carouselWrap){

            var pointLength = arr.length

            //无缝
            var needCarousel = carouselWrap.getAttribute("needCarousel");
            needCarousel = needCarousel == null?false:true;
            if(needCarousel){
                arr=arr.concat(arr);
            }

            var ulNode = document.createElement("ul");
            var styleNode = document.createElement("style");
            ulNode.classList.add("list");
            for(var i=0;i<arr.length;i++){
                ulNode.innerHTML+='<li><a href="javascript:;"><img src="'+arr[i]+'"/></a></li>';
            }
            styleNode.innerHTML=".carousel-wrap > .list > li{width: "+(1/arr.length*100)+"%;}.carousel-wrap > .list{width: "+arr.length+"00%}";
            carouselWrap.appendChild(ulNode);
            document.head.appendChild(styleNode);
            
            var imgNodes = document.querySelector(".carousel-wrap > .list > li > a >img");
            setTimeout(function(){
                carouselWrap.style.height=imgNodes.offsetHeight+"px";
            },100)

            var pointWrap = document.querySelector(".carousel-wrap > .point-wrap")
            if(pointWrap){
                for(var i=0;i<pointLength;i++){
                    if(i==0){
                        pointWrap.innerHTML = '<span class="active"></span>'
                    }else{
                        pointWrap.innerHTML += "<span></span>"
                    }
                }
                var pointNodes = document.querySelectorAll(".carousel-wrap > .point-wrap > span")
            }	



            /*滑屏
             * 	1.拿到元素一开始的位置
             * 	2.拿到手指一开始点击的位置
             * 	3.拿到手指move的实时距离
             * 	4.将手指移动的距离加给元素
             * */
            
            //手指一开始的位置
            var startX = 0
			var startY = 0

            //元素一开始的位置
            var elementX = 0
            var elementY = 0
            var index = 0

            var isX = true
            var isFirst = true
            carouselWrap.addEventListener("touchstart",function(ev){
                ev=ev||event;
                
                var TouchC = ev.changedTouches[0];
                ulNode.style.transition="none";

                // 无缝
                // 点击第一组的第一张时，跳到第二组的第一张
                // 点击第二组的最后一张，跳到第一的最后一张
                if(needCarousel){			
                    var index = zhuzhu.css(ulNode,"translateX")/document.documentElement.clientWidth
                    if(-index==0){
                        index = -pointLength
                    }else if(-index == (arr.length-1)){
                        index = -(pointLength-1)
                    }
                    zhuzhu.css(ulNode,"translateX",index*document.documentElement.clientWidth)
                }




                startX=TouchC.clientX;
                startY=TouchC.clientY
                elementX=zhuzhu.css(ulNode,"translateX");
                elementY=zhuzhu.css(ulNode,"translateY")
                // 清除定时器
                clearInterval(timer)
                isX = true
                isFirst = true
            })
            carouselWrap.addEventListener("touchmove",function(ev){
                if(!isX){
                    return
                }
               
                ev=ev||event;
                var TouchC = ev.changedTouches[0];
                var nowX = TouchC.clientX
                var nowY = TouchC.clientY
                var disX = nowX - startX
                var disY = nowY - startY
                zhuzhu.css(ulNode,"translateX",disX+elementX)
            
                if(isFirst){
                    isFirst = false
                
                    if(Math.abs(disY)>Math.abs(disX)){
                        isX = false
                        return
                    }
                }
            
            })
            carouselWrap.addEventListener("touchend",function(ev){
                ev=ev||event;
                
                //index抽象了ul的实时位置
                index = zhuzhu.css(ulNode,"translateX")/document.documentElement.clientWidth
                index = Math.round(index);
                /*if(disX>0){
                    index = Math.ceil(index);
                }else if(disX<0){
                    index = Math.floor(index);
                }*/
                //超出控制
                if(index>0){
                    index=0;
                }else if(index<1-arr.length){
                    index=1-arr.length
                }
                
                pointAuto(index) 							
                
                ulNode.style.transition = ".5s transform"
                zhuzhu.css(ulNode,"translateX",index*(document.documentElement.clientWidth))
                // 开启轮播
                if(needAuto){					
                    auto()
                }
            })
        
            // 自动轮播
            var timer = 0
            var needAuto = carouselWrap.getAttribute("needAuto");
            needAuto = needAuto == null?false:true;
            if(needAuto){
                auto()
            }
            function auto(){
                clearInterval(timer)
                timer = setInterval(function(){
                    if(index==1-arr.length){
                        ulNode.style.transition = "none"
                        index = 1-arr.length/2
                        zhuzhu.css(ulNode,"translateX",index*(document.documentElement.clientWidth))
                    }
                    setTimeout(function(){
                        index--
                        ulNode.style.transition = "1s transform"
                        zhuzhu.css(ulNode,"translateX",index*(document.documentElement.clientWidth))
                        pointAuto(index)
                    },50)
                },2000)
            }
            function pointAuto(index){
                if(!pointWrap){
                    return false
                }
                for(var i=0;i<pointLength;i++){
                    pointNodes[i].classList.remove("active")							
                }
                pointNodes[-index%pointLength].classList.add("active")
            }
        }
        
        
    }
    w.zhuzhu.dragNav = function(){
        var wrap = document.querySelector(".zhuzhu-wrap-drag-nav")
        var item = document.querySelector(".zhuzhu-wrap-drag-nav .list")
        var startX = 0
        var elementX = 0
        
        var minX = wrap.clientWidth - item.offsetWidth
        // 快速滑屏需要的变量
        var lastTime = 0
        var lastPoint = 0
        var disTime = 1
        var disPoint = 0
        wrap.addEventListener("touchstart",function(ev){
            ev = ev || event
            var touchC = ev.changedTouches[0]
            
            startX = touchC.clientX
            elementX = zhuzhu.css(item,"translateX")
            
            item.style.transition="none"
            
            lastTime = new Date().getTime()
            lastPoint = touchC.clientX

            // 清除速度
            disPoint = 0
            item.handMove = false

        })
        wrap.addEventListener("touchmove",function(ev){
            ev = ev|| event
            var touchC = ev.changedTouches[0]
            var nowX = touchC.clientX
            var disX = nowX - startX
            var translateX = elementX+disX
            

            var nowTime = new Date().getTime()
            var nowPoint = touchC.clientX
            
            disTime = nowTime - lastTime
            disPoint = nowPoint - lastPoint

            lastTime = nowTime
            lastPoint = nowPoint
            // 手动橡皮筋效果
            if(translateX>0){
                // translateX=0
                item.handMove = true
                var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth + translateX)*1.5)
                translateX = zhuzhu.css(item,"translateX") + disPoint*scale
            }else if(translateX<minX){
                // translateX = minX
                item.handMove = true
                var overX = minX-translateX
                var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth + overX)*1.5)
                translateX = zhuzhu.css(item,"translateX") + disPoint*scale
            }
            zhuzhu.css(item,"translateX",translateX)

            
        })

        wrap.addEventListener("touchend",function(ev){
            ev = ev|| event  
            var translateX = zhuzhu.css(item,"translateX")
            if(!item.handMove){
                // 快速滑屏
                // 速度越大位移越远
                var speed = disPoint/disTime
                speed = Math.abs(speed)<0.5?0:speed
                var targetX = translateX + speed*200
                var bsr = ""
                var time = Math.abs(speed)*0.2
                time = time>0.8?0.8:time
                time = time<2?2:time
                // 快速滑动橡皮筋效果
                if(targetX>0){
                    targetX=0
                    // zhuzhu.css(item,"translateX",translateX)    
                    bsr = "cubic-bezier(.26,1.51,.68,1.54) "
                }else if(targetX<minX){
                    targetX = minX
                    // zhuzhu.css(item,"translateX",translateX)  
                    bsr = "cubic-bezier(.26,1.51,.68,1.54) "                      
                }
                item.style.transition="1s "+bsr+"transform";
                zhuzhu.css(item,"translateX",targetX)
            }else{
                // 手动滑屏
                item.style.transition = "1s transform"
                if(translateX>0){
                    translateX = 0
                    zhuzhu.css(item,"translateX",translateX)
                }else if(translateX<minX){
                    translateX = minX
                    zhuzhu.css(item,"translateX",translateX)
                }
            }
        })
    }
    // 竖向滑屏
    w.zhuzhu.vMove = function(wrap,callBack){
        
        var item = wrap.children[0]
		zhuzhu.css(item,"translateZ",0.1)

		//元素一开始的位置  手指一开始的位置        
        var start={}
		var element ={}
		var minY = wrap.clientHeight - item.offsetHeight

        // 快速滑屏需要的变量
        var lastTime =0
		var lastPoint =0
		var timeDis =1 
		var pointDis =0
		
		var isY =true
        var isFirst = true
        
        //即点即停
        var cleartime =0
        
        var Tween = {
			Linear: function(t,b,c,d){ return c*t/d + b; },
			back: function(t,b,c,d,s){
	            if (s == undefined) s = 1.70158;
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        	}
        }
        
        wrap.addEventListener("touchstart",function(ev){
            ev = ev || event
            var touchC = ev.changedTouches[0]
            //重置minY!!
            minY = wrap.clientHeight - item.offsetHeight
            
            start = {clientX:touchC.clientX,clientY:touchC.clientY};
			element.y = zhuzhu.css(item,"translateY")
			element.x= zhuzhu.css(item,"translateX")
			
			item.style.transition="none"
            
            lastTime = new Date().getTime()
            lastPoint = touchC.clientY
            
            // 清除速度
            pointDis = 0
            item.handMove = false

            isY =true
            isFirst = true
            
            //即点即停
            clearInterval(cleartime)

            if(callBack&&typeof callBack["start"] === "function"){
				callBack["start"].call(item)
			}
        })
        wrap.addEventListener("touchmove",function(ev){
            if(!isY){
				return
			}
            
            
            ev = ev|| event
            var touchC = ev.changedTouches[0]

            var now = touchC
			var dis = {}            
            dis.y = now.clientY - start.clientY
			dis.x = now.clientX - start.clientX
			var translateY = element.y+dis.y
			
			if(isFirst){
				isFirst = false
				if(Math.abs(dis.x)>Math.abs(dis.y)){
					isY = false
					return
				}
			}


            var nowTime = new Date().getTime()
            var nowPoint = touchC.clientY
            
            timeDis = nowTime - lastTime
			pointDis = nowPoint - lastPoint
			
			lastTime = nowTime
			lastPoint = nowPoint

            
            // 手动橡皮筋效果
            if(translateY>0){
                // translateX=0
                item.handMove = true
                var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth + translateY)*1.5)
                translateY = zhuzhu.css(item,"translateY") + pointDis*scale
            }else if(translateY<minY){
                // translateX = minX
                item.handMove = true
                var over = minY-translateY
                var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth + over)*1.5)
                translateY = zhuzhu.css(item,"translateY") + pointDis*scale
            }
            zhuzhu.css(item,"translateY",translateY)

            if(callBack&&typeof callBack["move"] === "function"){
				callBack["move"].call(item)
			}
        })

        wrap.addEventListener("touchend",function(ev){
            ev = ev|| event  
            var translateY = zhuzhu.css(item,"translateY")
            if(!item.handMove){
                // 快速滑屏
                // 速度越大位移越远
                var speed = pointDis/timeDis
				speed = Math.abs(speed)<0.5?0:speed
				var targetY = translateY + speed*200
				var time = Math.abs(speed)*0.2
				time = time<0.8?0.8:time
				time = time>2?2:time
                // 快速滑动橡皮筋效果
                var type = "Linear"
                if(targetY>0){
                    targetY=0
                    // zhuzhu.css(item,"translateX",translateX)    
                    type = "back"
                }else if(targetY<minY){
                    targetY = minY
                    type = "back"
                    // zhuzhu.css(item,"translateX",translateX)  
                    // bsr = "cubic-bezier(.26,1.51,.68,1.54) "                      
                }
                // item.style.transition="1s "+bsr+"transform";
                // zhuzhu.css(item,"translateX",targetX)
                bsr(type,targetY,time)
            }else{
                // 手动滑屏
                item.style.transition = "1s transform"
                if(translateY>0){
                    translateY = 0
                    zhuzhu.css(item,"translateY",translateY)
                }else if(translateY<minY){
                    translateY = minY
                    zhuzhu.css(item,"translateY",translateY)
                }

                if(callBack&&typeof callBack["end"] === "function"){
					callBack["end"].call(item)
				}
            }
        })

        function bsr(type,targetY,time){
			clearInterval(cleartime);
			//当前次数
			var t=0;
			//初始位置
			var b = zhuzhu.css(item,"translateY");
			//最终位置 - 初始位置
			var c = targetY -b;
			//总次数
			var d = time*1000 / (1000/60);
			cleartime = setInterval(function(){
				t++;
				
				if(callBack&&typeof callBack["autoMove"] === "function"){
					callBack["move"].call(item);
				}
				
				if(t>d){
					clearInterval(cleartime);
					
					if(callBack&&typeof callBack["end"] === "function"){
						callBack["end"].call(item);
					}
				}
				var point = Tween[type](t,b,c,d);
				zhuzhu.css(item,"translateY",point);
			},1000/60);
		}


    }
})(window)