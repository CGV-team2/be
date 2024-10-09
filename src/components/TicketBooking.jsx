import React, { useState, useEffect } from "react";
import axios from "axios";
import TheaterSelector from "./TheaterSelector";
import BookingHeaderButton from "./BookingHeaderButton";
import { useNavigate, useLocation } from "react-router-dom";

import { IoMdRefresh } from "react-icons/io";
import { FaChevronRight } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

export const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

const TicketBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedHall, setSelectedHall] = useState("");
  const [movies, setMovies] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [isSeatSelected, setIsSeatSelected] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      const options = {
        method: "GET",
        url: "http://localhost:8080/movies/now_playing",
      };
  
      try {
        const response = await axios.request(options);
        console.log(response);
        
        // 여기에서 response.data 배열을 정렬
        const sortedMovies = response.data.sort(
          (a, b) => b.vote_average - a.vote_average
        );
        
        setMovies(sortedMovies);
        console.log(sortedMovies);
      } catch (error) {
        console.error("API를 불러오지 못했습니다.", error);
      }
    };

    fetchMovies();
    initializeDates();
  }, [location]);

  const initializeDates = () => {
    const today = new Date();
    const twoWeeksLater = new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000);
    const dates = [];

    for (
      let d = new Date(today);
      d <= twoWeeksLater;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(new Date(d));
    }

    setDateRange(dates);
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}.${month}.${day}`;
  };

  const screenings = {
    "1관": ["09:00", "12:00", "15:00"],
    "2관": ["10:30", "13:10", "16:20"],
  };

  const getWeekday = (date) => {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return weekdays[date.getDay()];
  };

  const getWeekdayColor = (weekday) => {
    if (weekday === "토") return "text-[#31597E]";
    if (weekday === "일") return "text-[#AD2727]";
    return "text-gray-700";
  };

  const renderDateButtons = () => {
    let lastRenderedMonth = null;
    let lastRenderedYear = null;

    return dateRange.map((date, index) => {
      const weekday = getWeekday(date);
      const weekdayColor = getWeekdayColor(weekday);
      const formattedDate = formatDate(date);
      const month = date.getMonth();
      const year = date.getFullYear();

      let monthYearHeader = null;
      if (month !== lastRenderedMonth || year !== lastRenderedYear) {
        monthYearHeader = (
          <div
            key={`header-${year}-${month}`}
            className="w-full text-center py-3 text-[#666666]"
          >
            <div>{year}</div>
            <div className="text-3xl">{month + 1}</div>
          </div>
        );
        lastRenderedMonth = month;
        lastRenderedYear = year;
      }

      const dateButton = (
        <button
          key={index}
          className={`w-full flex justify-between items-center px-2 py-1 my-1 ${
            selectedDate === formattedDate
              ? "bg-[#333333] text-white border-2 border-black"
              : "bg-[#F2F0E5]"
          }`}
          onClick={() => setSelectedDate(formattedDate)}
        >
          <span
            className={`
              font-normal ${selectedDate === formattedDate ? "text-white" : weekdayColor}`}
          >
            {weekday}
          </span>
          <span
            className={`text-sm ${!(selectedDate === formattedDate) && weekday === "토" ? "text-[#31597E]" : !(selectedDate === formattedDate) && weekday === "일" ? "text-[#AD2727]" : ""}`}
          >
            {date.getDate()}
          </span>
        </button>
      );

      return monthYearHeader ? [monthYearHeader, dateButton] : dateButton;
    });
  };

  const handleNavigateSeat = () => {
    if (isSeatSelected) {
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

  useEffect(() => {
    if (selectedMovie && selectedDate && selectedTheater && selectedTime) {
      setIsSeatSelected(true);
    } else {
      setIsSeatSelected(false);
    }
  }, [selectedMovie, selectedDate, selectedTheater, selectedTime]);

  const renderScreenings = () => {
    if (!selectedMovie || !selectedTheater || !selectedDate) {
      return (
        <div className="text-center mt-48 h-full font-normal text-xs text-gray-500">
          영화, 극장, 날짜를 선택해주세요
        </div>
      );
    }

    return Object.entries(screenings).map(([hall, times]) => (
      <div key={hall} className="mb-4">
        <div className="mb-2">
          <span className="text-[#B54D15]">2D</span> {hall}
        </div>
        <ul className="flex flex-wrap gap-2">
          {times.map((time) => (
            <li key={time}>
              <button
                className={`text-sm py-1 px-2 ${
                  selectedTime === time && selectedHall === hall
                    ? "bg-[#333333] text-white border-2 border-black"
                    : "bg-[#F2F0E5] border border-[#D4D3C9]"
                }`}
                onClick={() => {
                  setSelectedTime(time);
                  setSelectedHall(hall);
                }}
              >
                {time}
              </button>
            </li>
          ))}
        </ul>
      </div>
    ));
  };

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
        <div className="w-[996px] mx-auto text-xs font-bold">
          <BookingHeaderButton />

          <div className="border-2 border-[#D4D3C9]">
            <div className="bg-[#F2F0E5] overflow-hidden">
              <div className="flex border-b h-[600px]">
                <div className="w-[27.27%] border-r-2 border-[#D4D3C9] flex flex-col">
                  <h2 className="w-full h-9 bg-[#333333] text-base text-white font-bold flex justify-center items-center flex-shrink-0">
                    영화
                  </h2>

                  <ul className="overflow-auto flex-grow p-4">
                    {movies.map((movie, index) => (
                      <li
                        key={index}
                        className={`cursor-pointer p-2  ${
                          selectedMovie &&
                          selectedMovie.id === movie.id &&
                          "bg-[#333333] text-white"
                        }`}
                        onClick={() => setSelectedMovie(movie)}
                      >
                        {movie.title}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="w-[27.27%] border-r-2 border-[#D4D3C9] flex flex-col">
                  <h2 className="w-full h-9 bg-[#333333] text-base text-white text-center flex justify-center items-center flex-shrink-0">
                    극장
                  </h2>
                  <TheaterSelector onSelectTheater={setSelectedTheater} />
                </div>

                <div className="w-[9.09%] border-r-2 border-[#D4D3C9] flex flex-col">
                  <h2 className="w-full h-9 bg-[#333333] text-base text-white text-center flex justify-center items-center flex-shrink-0">
                    날짜
                  </h2>
                  <div className="text-center overflow-auto flex-grow px-2.5 py-4">
                    <div className="flex flex-col items-center">
                      {renderDateButtons()}
                    </div>
                  </div>
                </div>

                <div className="w-[36.36%] flex flex-col">
                  <h2 className="w-full h-9 bg-[#333333] text-base text-white text-center flex justify-center items-center flex-shrink-0">
                    시간
                  </h2>

                  <div className="p-4 h-full">
                    <div className="flex items-center pb-2 mb-3 border-b-[3px] border-[#CFCDC3]">
                      <div className="w-4 h-4 bg-[url('http://img.cgv.co.kr/CGV_RIA/Ticket/image/reservation/icon/icon_morning_night.png')] bg-no-repeat bg-[0_0px] mr-1"></div>
                      <span className="mr-3">모닝</span>

                      <div className="w-4 h-4 bg-[url('http://img.cgv.co.kr/CGV_RIA/Ticket/image/reservation/icon/icon_morning_night.png')] bg-no-repeat bg-[0_-20px]"></div>
                      <span>심야</span>
                    </div>

                    {renderScreenings()}
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

      <div className="pretendard h-32 bg-[#1D1D1C] text-white/80 p-3">
        <div className="w-[996px] h-full mx-auto flex justify-between items-center px-2">
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
                    <span>-</span>
                  </div>
                </div>
              ) : (
                <p className="mx-auto text-2xl text-white/50">극장선택</p>
              )}
            </div>

            <div className="ml-5 flex items-center text-2xl text-white/50">
              <FaChevronRight size={33} />
              좌석선택
            </div>

            <div className="ml-5 flex items-center text-2xl text-white/50">
              <FaChevronRight size={33} />
              결제
            </div>
          </div>

          <button
            className={`pretendard w-[106px] h-full rounded-xl border-[3px] font-bold text-white flex flex-col justify-center items-center ${isSeatSelected ? "border-[#DC3434] bg-[#BF2828]" : "border-[#979797] bg-[#343433]"}`}
            onClick={handleNavigateSeat}
            disabled={!isSeatSelected}
          >
            <FaArrowRight size={41} className="mb-1" />
            좌석선택
          </button>
        </div>
      </div>
    </>
  );
};

export default TicketBooking;
