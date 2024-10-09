import axios from "axios";
import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [idValid, setIdValid] = useState(false);
  const [pwValid, setPwValid] = useState(false);
  const [notAllow, setNotAllow] = useState(true);

  const handleId = (e) => {
    setId(e.target.value);
    const regex = /^(?=.*[A-Za-z])(?=.*?[0-9]).{6,}$/;

    if (regex.test(e.target.value)) {
      setIdValid(true);
    } else {
      setIdValid(false);
    }
  };

  const handlePw = (e) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    setPw(e.target.value);

    if (regex.test(e.target.value)) {
      setPwValid(true);
    } else {
      setPwValid(false);
    }
  };

  useEffect(() => {
    if (idValid && pwValid) {
      setNotAllow(false);
    } else {
      setNotAllow(true);
    }
  }, [idValid, pwValid]);

  const handleLogin = async () => {
    if (id.length == 0 && pw.length == 0) {
      alert("아이디와 패스워드를 입력해주세요");
    } else {
      try {
        const response = await axios.post("http://localhost:8080/user/login", {
          userId: id,
          password: pw,
        });

        if (response.status === 200 && response.data) {
          const token = response.data;
          localStorage.setItem("token", token);

          window.location.reload();
          
        } else {
          alert("유효하지 않은 아이디, 비밀번호입니다.");
          console.log(response.data);
        }
      } catch (error) {
        console.error("Login.jsx handleLogin error : ", error);
        alert("로그인 실패");
      }
    }
  };

  return (
    <>
      <div className="pretendard min-w-[350px] w-1/4 mx-auto my-10">
        <div className="text-2xl font-bold">
          아이디와 비밀번호를
          <br /> 입력해주세요.
        </div>

        <div className="my-8">
          <div className="text-xs font-bold ml-1 mb-2">아이디</div>
          <input
            className="border-2 rounded-md w-full h-12 px-4"
            type="text"
            placeholder="test1234"
            value={id}
            onChange={handleId}
          />
          {!idValid && id.length > 0 && (
            <div className="text-[12px] text-red-500 mt-[8px] ml-1">
              영문, 숫자 포함 6자 이상 입력해주세요
            </div>
          )}
          {/* { a && b && (div)} */}
        </div>

        <div>
          <div className="text-xs font-bold ml-1 mb-2">비밀번호</div>
          <input
            className="border-2 rounded-md w-full h-12 px-4"
            type="password"
            placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            value={pw}
            onChange={handlePw}
          />
          {!pwValid && pw.length > 0 && (
            <div className="text-[12px] text-red-500 mt-[8px] ml-1">
              영문, 숫자, 특수문자 포함 8자 이상 입력해주세요
            </div>
          )}
        </div>
        <button
          className="bg-[#FB4357] w-full h-12 text-white font-bold rounded-lg mt-12"
          disabled={notAllow}
          onClick={handleLogin}
        >
          확인
        </button>
      </div>
    </>
  );
}
