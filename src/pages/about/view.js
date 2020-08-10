import React from 'react'
import {
  Icon
} from 'antd'
import { connect } from 'react-redux'
import './about.css'
import logo from '@/assets/images/AboutPageLogo.png'
import ipcChannel from '@/util/ipc/ipcChannel'
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'

class About extends React.Component{

  componentDidMount() {
  }

  render() {
    return(
          <div
            className="root"
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            <img
              onDragStart={
                (e) => {
                  if (e && e.preventDefault) {
                    e.preventDefault();
                  } else {
                    window.event.returnValue = false;
                  }
                }
              }
              src={`${logo}`}
              style={{
                zIndex: 999,
                position: "absolute",
                marginLeft: "-50px",
                marginTop: "35px"
              }}
            />
            <div
              style={{
                height: "40px",
                width: "100%",
                WebkitAppRegion: "drag",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: "10px"
              }}
            >
              <Icon
                type="close"
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  WebkitAppRegion: "no-drag",
                }}
                onClick={()=>{
                  IpcRendererSendSync(ipcChannel.CloseAboutWindow, {})
                }}
              />
            </div>
            <div
              style={{
                height: "90px",
                width: "100%"
              }}
            >
            </div>
            <div
              style={{
                height: "230px",
                width: "100%",
                paddingTop: "80px",
                backgroundColor: "#70787D",
                color: "#FFFFFF"
              }}
            >
              <p style={{height: "30px", lineHeight: "30px", textAlign: "center"}}>
                <Icon
                  type="github"
                  style={{
                    cursor: "pointer",
                    fontSize: "20px"
                  }}
                  onClick={()=>{
                    IpcRendererSendSync(ipcChannel.OpenGitHub, {})
                  }}
                />
              </p>
              <p style={{height: "30px", lineHeight: "30px", textAlign: "center"}}>
                Version: 1.0.0-alpha.0
              </p>
              <p style={{height: "30px", lineHeight: "30px", textAlign: "center"}}>
                Version: 1.0.0-alpha.0
              </p>
              <p style={{height: "30px", lineHeight: "30px", textAlign: "center"}}>
                Copyright © 2020 Alex
              </p>
            </div>
          </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    ...state
  }
}
const mapDispatchToProps = (dispatch, ownProps) => ({
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(About)