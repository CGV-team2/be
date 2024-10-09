import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { FaRegClock } from "react-icons/fa";
import { FaRegThumbsUp } from "react-icons/fa";
import api from "../api/api";

export const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function Movie() {
  const navigate = useNavigate();
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const [sortOrder, setSortOrder] = useState("1");
  const [selectedMovie, setSelectedMovie] = useState(null);

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
  }, [location]);

  //셀렉트 박스 정렬방식
  const sortMovies = (order) => {
    let sortedMovies = [...movies];
    if (order === "1") {
      // Sort by rating (descending)
      sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
    } else if (order === "2") {
      // Sort by release date (most recent first)
      sortedMovies.sort(
        (a, b) => new Date(b.release_date) - new Date(a.release_date)
      );
    }
    setMovies(sortedMovies);
  };

  const handleSortChange = (event) => {
    const newSortOrder = event.target.value;
    setSortOrder(newSortOrder);
    sortMovies(newSortOrder);
  };

  const navigateToMovieDetail = (movieId) => {
    const selected = movies.find((movie) => movie.id === movieId);
    navigate("/movie-detail", { state: { movie: selected } });
  };

  const navigateToTicketPage = (movieId) => {
    const selected = movies.find((movie) => movie.id === movieId);
    navigate("/ticket", { state: { selectedMovie: selected } });
  };

  return (
    <>
      <div className="noto-sans w-[996px] mx-auto pt-10 pb-20">
        <div className="border-b-[3px] border-b-black pb-6 text-4xl font-bold">
          무비차트
        </div>

        <div className="mt-4 flex justify-end items-center pr-7">
          <label htmlFor="order_type" className="mr-2">
            정렬 :
          </label>
          <select
            id="order_type"
            value={sortOrder}
            onChange={handleSortChange}
            className="p-1 border rounded"
          >
            <option value="1">평점순</option>
            <option value="2">최신순</option>
          </select>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-x-[70px] gap-y-16">
          {movies.map((movie, index) => (
            <React.Fragment key={movie.id}>
              {index === 3 && (
                <div className="w-full h-full mx-auto text-2xl font-bold bg-[#222221] p-5 flex flex-col text-white">
                  <img
                    src="https://adimg.cgv.co.kr/images/202302/house/CGV_BUGS_160x300.png"
                    alt="Ad"
                    className="w-full"
                  />
                  <div className="text-xs mt-5">
                    <p className="border-b-4 border-white pb-1.5">
                      <span className="text-[11px] text-[#E71A0F] border-2 border-[#E71A0F] mr-2 px-1">
                        AD
                      </span>
                      CGV X Bugs
                    </p>
                    <p className="border-b-4 border-white py-1.5">
                      MUSIC & Movie 감성 페어링
                    </p>
                  </div>
                </div>
              )}

              {index !== 3 && (
                <div className="w-full mx-auto">
                  <div
                    className={`h-8 mb-1 text-white text-xl font-bold flex items-center justify-center ${
                      index < 3 ? "bg-[#FB4357]" : "bg-black"
                    }`}
                  >
                    No.{index < 3 ? index + 1 : index}
                  </div>

                  <img
                    src={`${IMG_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full max-h-[260px] cursor-pointer"
                    onClick={() => navigateToMovieDetail(movie.id)}
                  />

                  <div className="pt-2 pb-4">
                    <div
                      className="font-bold h-5 overflow-hidden cursor-pointer"
                      onClick={() => navigateToMovieDetail(movie.id)}
                    >
                      {movie.title}
                    </div>

                    <div className="flex flex-wrap items-center mt-2 font-bold text-xs text-[#666666]">
                      <div className="flex items-center">
                        <FaRegClock />
                        <span className="mx-1">개봉일</span>
                        <span>{movie.release_date}</span>
                      </div>
                      <div className="mx-2 h-4 w-px bg-gray-300"></div>
                      <div className="flex items-center">
                        <FaRegThumbsUp />
                        <span className="mx-1">평점</span>
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-[97px] h-[25px] rounded-[5px] bg-[#FF4357] text-white text-[13px] font-bold"
                    onClick={() => navigateToTicketPage(movie.id)}
                  >
                    예매하기
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
