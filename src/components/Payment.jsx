import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BookingHeaderButton from "./BookingHeaderButton";
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import axios from "axios";

export const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(""); // 오류 메시지 상태 관리


    //사용자 이름 가져오기
    useEffect(() => {
      const fetchUserName = async () => {
        try {
          const token = localStorage.getItem("token"); // 로컬스토리지에서 JWT 토큰 가져오기
  
          const response = await axios.get("http://localhost:8080/user/name", {
            headers: {
              Authorization: `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 포함
            },
          });
  
          setUserName(response.data); // 가져온 사용자 이름을 상태에 저장
        } catch (err) {
          console.error("사용자 이름을 가져오는 데 실패했습니다.", err);
          setError("사용자 이름을 불러오는 데 실패했습니다.");
        }
      };
  
      fetchUserName();
    }, []); 

  // SeatSelection에서 전달된 상태 받기
  const {
    selectedMovie,
    selectedTheater,
    selectedDate,
    selectedTime,
    selectedHall,
    selectedSeats,
    counts,
    totalAmount,
  } = location.state || {};

  // 결제 옵션 상태 관리
  const paymentOptions = [
    { text: "신용카드", value: 0 },
    { text: "휴대폰 결제", value: 1 },
    { text: "간편결제", value: 2 },
    { text: "내통장결제", value: 3 },
    { text: "토스", value: 4 },
  ];
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [selectedCard, setSelectedCard] = useState("카드를 선택하세요");
  const [paymentMethod, setPaymentMethod] = useState("신용카드");

  const onChangeRadio = (e) => {
    const selectedValue = Number(e.target.value);
    setSelectedPayment(selectedValue);

    // paymentOptions에서 선택된 결제 수단을 찾아서 text 값을 setPaymentMethod에 설정
    const selectedOption = paymentOptions.find(
      (option) => option.value === selectedValue
    );
    if (selectedOption) {
      setPaymentMethod(selectedOption.text);
    }
  };

  const cardOptions = [
    "카드를 선택하세요",
    "BC카드",
    "국민카드",
    "삼성카드",
    "신한카드",
    "현대카드",
    "롯데카드",
    "하나카드",
    "우리카드",
    "씨티카드",
    "NH농협카드",
    "카카오뱅크카드",
    "신세계카드",
    "전북카드",
    "광주카드",
    "수협카드",
    "제주카드",
    "산은카드",
    "MG새마을금고",
    "우체국카드",
    "KDB산업은행카드",
  ];

  // 전달된 상태가 없을 경우 SeatSelection으로 리다이렉트
  if (
    !selectedMovie ||
    !selectedTheater ||
    !selectedDate ||
    !selectedTime ||
    !selectedHall ||
    !selectedSeats ||
    !counts ||
    !totalAmount
  ) {
    navigate("/ticket/seat-selection"); // 적절한 경로로 수정하세요
    return null;
  }

  const getWeekday = (date) => {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return weekdays[date.getDay()];
  };

  // 카테고리 라벨 매핑
  const countLabels = {
    adult: "일반",
    youth: "청소년",
    senior: "경로",
    child: "우대",
  };

  // 카테고리별 선택된 인원 수 및 가격 계산
  const priceMapping = {
    adult: 14000,
    youth: 11000,
    senior: 7000,
    child: 5000,
  };

  const categoryTotals = Object.entries(counts)
    .filter(([type, count]) => count > 0)
    .map(([type, count]) => ({
      type: countLabels[type],
      count,
      price: priceMapping[type], // 단가 추가
      total: count * priceMapping[type],
    }));

  const handleNavigateSeat = () => {
    if (selectedMovie && selectedTheater && selectedDate && selectedTime) {
      navigate("/ticket/seat", {
        state: {
          selectedMovie: {
            ...selectedMovie,
            posterUrl: `${IMG_BASE_URL}${selectedMovie.poster_path}`,
          },
          selectedMovie,
          selectedTheater,
          selectedDate,
          selectedTime,
          selectedHall,
        },
      });
    }
  };
  
  //kg 이니시스 모듈 호출
  const handlePayment = () => {
    if (!window.IMP) {
      alert("결제 모듈을 불러오는 데 실패했습니다. 다시 시도해 주세요.");
      return;
    }

    const IMP = window.IMP;
    IMP.init('imp30331400'); 
  
    // 아임포트 결제창 호출
    IMP.request_pay(
      {
        pg: 'html5_inicis', // KG이니시스
        merchant_uid: 'order_' + new Date().getTime(), // 주문 번호
        name: '영화 결제', // 결제 이름
        // amount: totalAmount,
        amount: 100,
        buyer_name: userName,
        buyer_tel: '010-1234-5678', // 구매자 전화번호
      },
      (rsp) => {
        if (rsp.success) {
          // 토큰 가져오기
          const token = localStorage.getItem("token");

          // 결제 성공 시 reservation/pay API 호출
          axios
            .post('http://localhost:8080/api/reservation/pay', {
              userId: userName, // 토큰에서 사용자 정보 가져오기
              movieId: selectedMovie.title,
              cinemaName: selectedTheater,
              screenName: selectedHall,
              showDate: selectedDate,
              showTime: selectedTime,
              seatNumbers: selectedSeats,
              paymentRequest: {
                impUid: rsp.imp_uid, // 아임포트 고유 ID
                merchantUid: rsp.merchant_uid, // 주문 번호
              },
            }, {
              headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 포함
              }
            })
            .then((response) => {
              // 예약 성공 시 처리
              alert('결제 및 예약이 완료되었습니다.');
              navigate('/reservation-confirmation', { state: { reservationData: response.data } });
            })
            .catch((error) => {
              console.error('예약 실패:', error);
              alert('예약에 실패했습니다.');
            });
        } else {
          alert('결제 실패: ' + rsp.error_msg);
        }
      }
    );
  };
  // 카테고리별 선택된 인원 수 표시
  const countsDisplay = categoryTotals
    .map(({ type, count }) => `${type} ${count}명`)
    .join(", ");

  return (
    <>
      <div className="w-[1316px] mx-auto mt-8 select-none flex">
        <div className="w-[160px] h-[300px] mr-1 mt-11">
          <img
            src="https://adimg.cgv.co.kr/images/202302/house/CGV_BUGS_160x300.png"
            alt="Left Ad"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-[996px]">
          <BookingHeaderButton />

          <div className="bg-[#F2F0E5] flex">
            <div className="w-[74%]">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`${
                      step > 1 ? "mt-7" : "mt-1"
                    } px-5 bg-[#333333] h-8 flex items-center justify-between font-bold text-[#E0E0E0] text-lg`}
                  >
                    <span>
                      STEP {step}.
                      {step === 4 && (
                        <span className="text-sm"> 최종결제 수단</span>
                      )}
                    </span>
                    <span className="text-xs">다시하기</span>
                  </div>

                  {step === 4 ? (
                    <div className="mt-1 border-t-[3px] border-x-[3px] border-[#DFDED6] font-bold text-sm">
                      <div className="px-4">
                        <div className="flex">
                          {paymentOptions.map((option, idx) => (
                            <label key={idx} className="block mr-4 py-3">
                              <input
                                type="radio"
                                value={option.value}
                                onChange={onChangeRadio}
                                checked={option.value === selectedPayment}
                                className="mr-2"
                              />
                              <span>{option.text}</span>
                            </label>
                          ))}
                        </div>

                        {selectedPayment === 0 && ( // 신용카드 선택 시 카드 종류 선택
                          <div className="border-t-[3px] border-[#DFDED6] text-xs font-normal flex justify-between">
                            <div className="w-[69%]">
                              <div className="border-b-2 border-[#DFDED6] py-1.5 pl-9">
                                <span>카드종류</span>
                                <select
                                  value={selectedCard}
                                  onChange={(e) =>
                                    setSelectedCard(e.target.value)
                                  }
                                  className="w-40 ml-3 py-1.5 px-1 border border-[#ACABA2] bg-[#F2F0E5]"
                                >
                                  {cardOptions.map((card, index) => (
                                    <option key={index} value={card}>
                                      {card}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <img
                                src="http://img.cgv.co.kr/Ria/RiaBanner/17029662369850.png"
                                alt="AD"
                                className="h-[200px] w-[192px] my-4"
                              />
                            </div>
                          </div>
                        )}

                        <div className="bg-[#EBE9DF] w-full text-[#666666] text-xs font-normal py-5 px-7">
                          <p className="mb-1">
                            ※ 신용카드 결제 가능 최소 금액은 1,000원 이상입니다.
                          </p>

                          <span className="desc">
                            <a href="#" className="underline">
                              삼성U포인트 적립
                            </a>
                            &nbsp;&nbsp;
                            <a href="#" className="underline">
                              OK캐쉬백 적립
                            </a>
                            &nbsp;&nbsp;
                            <a href="#" className="underline">
                              신세계포인트 적립
                            </a>
                          </span>
                          <br />
                          <span className="option">
                            (삼성U포인트, OK캐쉬백, 신세계포인트는 포인트 중복
                            적립 불가)
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 px-5 bg-[#DFDED6] h-11 flex items-center justify-between font-bold text-sm">
                      {step === 1 && "할인쿠폰"}
                      {step === 2 && "관람권/기프티콘"}
                      {step === 3 && "포인트 및 기타결제 수단"}
                      <IoIosArrowDown size={35} className="text-[#898984]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="w-[26%] text-[#333333] font-bold text-sm">
              <div className="float-right">
                <div className="bg-white p-4 drop-shadow-md">
                  {/* 결제 금액 */}
                  <div className="w-[192px] h-[76px] border-[2.5px] border-[#202020] rounded">
                    <div className="h-[45%] flex justify-center items-center border-b border-[#333333]">
                      결제하실 금액
                    </div>
                    <div className="h-[55%] bg-[#474747] text-white flex items-center justify-end pr-2 text-xs">
                      <span className="text-xl">
                        {totalAmount.toLocaleString()}
                      </span>
                      원
                    </div>
                  </div>

                  {/* 할인 내역 */}
                  <div className="w-[192px] h-[105px] border-[2.5px] border-[#202020] rounded my-5">
                    <div className="h-[28.57%] flex justify-center items-center border-b border-[#333333] bg-[#D9E7EB]">
                      할인내역
                    </div>
                    <div className="h-[31.43%] flex justify-center items-center border-b border-[#333333]">
                      총 할인금액
                    </div>
                    <div className="h-[40%] bg-[#3C464F] text-[#89E5FF] flex items-center justify-end pr-2 text-xs">
                      <span className="text-xl">0</span>원
                    </div>
                  </div>

                  {/* 결제 내역 */}
                  <div className="w-[192px] h-[140px] border-[2.5px] border-[#202020] rounded">
                    <div className="h-[20.71%] flex justify-center items-center border-b border-[#333333]/[.15] bg-[#F0EBD2]">
                      결제내역
                    </div>
                    <div className="h-[25.71%] flex justify-between items-center border-b border-[#333333] text-xs font-normal px-2">
                      <span>{paymentMethod}</span>
                      <span>{totalAmount.toLocaleString()}원</span>
                    </div>
                    <div className="h-[24.29%] flex justify-center items-center border-b border-[#333333]">
                      남은 결제금액
                    </div>
                    <div className="h-[29.29%] bg-[#443128] text-[#FFE56B] flex items-center justify-end pr-2 text-xs">
                      <span className="text-xl">
                        {totalAmount.toLocaleString()}
                      </span>
                      원
                    </div>
                  </div>
                </div>

                {/* 할인 정보 */}
                <div className="mt-3 tracking-tighter">
                  <div className="flex items-center font-normal text-[11px] border-b border-[#D7D6CF]">
                    <img
                      src="http://img.cgv.co.kr/Ria/RiaBanner/16249345262810.png"
                      className="mr-1"
                      alt="할인 정보"
                    />
                    <span>10포인트부터 티켓 전액 결제가능!</span>
                  </div>
                  <div className="flex items-center font-normal text-[11px] border-b border-[#D7D6CF]">
                    <img
                      src="http://img.cgv.co.kr/Ria/RiaBanner/16249334008850.png"
                      className="mr-1"
                      alt="할인 정보"
                    />
                    <span>M포인트 사용하고 즉시 할인받자</span>
                  </div>
                  <div className="flex items-center font-normal text-[11px] border-b border-[#D7D6CF]">
                    <img
                      src="http://img.cgv.co.kr/Ria/RiaBanner/16249345262650.png"
                      className="mr-1"
                      alt="할인 정보"
                    />
                    <span>현금처럼 꿀머니 사용가능!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[160px] h-[300px] ml-1 mt-11">
          <img
            src="https://adimg.cgv.co.kr/images/202302/house/CGV_BUGS_160x300.png"
            alt="Right Ad"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 푸터 */}
      <div className="pretendard h-32 bg-[#1D1D1C] text-white/80 p-3">
        <div className="w-[996px] h-full mx-auto flex justify-between items-center">
          <button
            className="pretendard w-[106px] h-full rounded-xl border-[3px] font-bold text-white flex flex-col justify-center items-center border-[#979797] bg-[#343433]"
            onClick={handleNavigateSeat}
          >
            <FaArrowLeft size={41} className="mb-1" />
            좌석선택
          </button>

          <div className="flex items-center">
            <div className="w-[212px] h-24 border-r-[3px] border-white/20 flex items-center overflow-hidden">
              {selectedMovie ? (
                <div className="flex">
                  <img
                    src={`${IMG_BASE_URL}${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                    className="h-[104px] w-[74px] object-cover mr-4"
                  />
                  <p className="pt-4 pr-1 text-xs break-words overflow-hidden">
                    {selectedMovie.title}
                  </p>
                </div>
              ) : (
                <p className="mx-auto text-2xl text-white/50">영화선택</p>
              )}
            </div>

            <div className="w-[187px] h-24 border-r-[3px] border-white/20 flex items-center px-2">
              {selectedTheater || selectedDate ? (
                <div className="flex">
                  <div className="flex flex-col text-xs mr-1">
                    <span className="mb-1">극장</span>
                    <span className="mb-1">일시</span>
                    <span className="mb-1">상영관</span>
                    <span>인원</span>
                  </div>

                  <div className="flex flex-col text-xs font-bold">
                    <span className="mb-1">
                      {selectedTheater ? `CGV ${selectedTheater} >` : "-"}
                    </span>
                    <span className="mb-1">
                      {selectedDate && selectedTime
                        ? `${selectedDate}(${getWeekday(new Date(selectedDate))}) ${selectedTime}`
                        : selectedDate
                          ? `${selectedDate}(${getWeekday(new Date(selectedDate))})`
                          : "-"}
                    </span>
                    <span className="mb-1">{selectedHall || "-"}</span>
                    <span>{countsDisplay || "-"}</span>
                  </div>
                </div>
              ) : (
                <p className="mx-auto text-2xl text-white/50">극장선택</p>
              )}
            </div>

            {/* 선택된 좌석 및 가격 정보 */}
            <div className="w-[170px] h-24 p-2 text-2xl text-white/50">
              {selectedSeats.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <FaArrowRight size={33} />
                  좌석선택
                </div>
              ) : (
                <div className="h-full flex items-center text-white/80">
                  <span className="text-xs mr-1">좌석번호 </span>
                  <span className="font-bold text-xs mr-1">
                    {selectedSeats.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            className={`pretendard w-[220px] h-full rounded-xl border-[3px] font-bold text-white text-2xl flex items-center justify-center ${
              totalAmount > 0
                ? "border-[#DC3434] bg-[#BF2828] cursor-pointer"
                : "border-[#979797] bg-[#343433] cursor-not-allowed"
            }`}
            disabled={totalAmount <= 0}
            onClick={handlePayment} // 결제 버튼에 handlePayment 함수 연결
          >
            <FaCheck size={44} className="mr-3" />
            결제하기
          </button>
        </div>
      </div>
    </>
  );
}
