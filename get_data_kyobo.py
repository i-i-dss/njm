import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from get_data_class import BaseCrawler

def fetch_reviews(max_pages=3):
    # 크롤러 초기화
    kb = BaseCrawler(headless=True)
    kb.driver.get('https://www.kyobobook.co.kr/')

    try:
        # 검색어 입력 및 검색 실행
        search_box = kb.driver.find_element(By.XPATH, '/html/body/div[1]/header/div[3]/div[1]/section/section[2]/form/input')
        search_box.send_keys('철학' + Keys.ENTER)
        time.sleep(2)

        reviews = {}
        

        for page in range(1, max_pages + 1):
            kb.driver.get(f'https://search.kyobobook.co.kr/search?keyword=%EC%B2%A0%ED%95%99&gbCode=TOT&target=total&page={page}')
            time.sleep(2)

            index = 0
            
            while True:
                # 책 제목 및 리뷰 요소 가져오기
                book_title_elems = kb.driver.find_elements(By.XPATH, '//*[starts-with(@id, "cmdtName_")]')
                review_elems = kb.driver.find_elements(By.CLASS_NAME, 'review_desc')

                if index >= len(book_title_elems):
                    break

                try:
                    book_title = book_title_elems[index].text.strip()
                    review_text = review_elems[index].text.strip()

                    if not book_title:
                        index += 1
                        continue

                    if review_text == "(0)":
                        reviews[book_title] = "리뷰 없음"
                        index += 1
                        continue

                    # 리뷰 클릭 및 상세 리뷰 가져오기
                    reviews[book_title] = []
                    print(f"{book_title}")
                    kb.scroll_into_view(review_elems[index])
                    review_elems[index].click()
                    time.sleep(3)

                    try:
                        WebDriverWait(kb.driver, 10).until(
                            EC.presence_of_element_located((By.XPATH, '//*[@id="ReviewList1"]/div[3]/div[2]/div/div[1]/div[1]/div[2]/div/div/div/div'))
                        )
                        # 스크롤 반복하며 리뷰 로드
                        container = kb.driver.find_element(By.XPATH, '//*[@id="ReviewList1"]/div[3]/div[2]/div')
                        kb.scroll_to_bottom(container)
                        time.sleep(2)
                        review_texts = kb.driver.find_elements(By.CLASS_NAME, 'comment_text')
                        reviews[book_title] = [r.text.strip() for r in review_texts]
                    except TimeoutException:
                        print(f"{book_title} - 리뷰 로딩 실패")

                    # 뒤로가기 및 요소 새로고침
                    kb.driver.back()
                    time.sleep(3)

                except StaleElementReferenceException:
                    print(f"{book_title} - stale element로 인해 스크롤 생략")
                    break

                index += 1

        # 결과 저장
        with open("reviews_kyobo.json", "w", encoding="utf-8") as f:
            json.dump(reviews, f, ensure_ascii=False, indent=4)

    except NoSuchElementException:
        print("리뷰 요소를 찾을 수 없습니다.")

    finally:
        kb.driver.quit()

if __name__ == "__main__":
    fetch_reviews()