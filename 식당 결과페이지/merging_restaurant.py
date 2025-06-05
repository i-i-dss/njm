import json
import re
from pathlib import Path
from typing import Dict, Any, Union

def normalize_restaurant_name(name: str) -> str:
    name = re.sub(r"\s*\([^)]*\)$", "", name)  # 괄호 제거
    return re.sub(r"\s+[가-힣]+점$", "", name)  # 지점명 제거

def merge_site_data(
    data_nm: Dict[str, Any],
    data_ct: Dict[str, Any],
    data_km: Dict[str, Any],
) -> Dict[str, Dict[str, Any]]:
    merged: Dict[str, Dict[str, Any]] = {}

    for source_name, dataset in [
        ("naver", data_nm),
        ("catchtable", data_ct),
        ("kakaomap", data_km),
    ]:
        for raw_name, info in dataset.items():
            base_name = normalize_restaurant_name(raw_name)
            entry = merged.setdefault(base_name, {
                "total_reviews": 0,
                "rating_sum": 0.0,
                "rated_count": 0
            })

            # ✅ 주소 저장은 naver에서만
            if source_name == "naver":
                if isinstance(info, dict) and info.get("address"):
                    entry["address"] = info["address"]

            # ✅ 리뷰 수 계산
            if source_name in ["naver", "kakaomap"]:
                comments = info.get("comment", [])
                if isinstance(comments, list):
                    entry["total_reviews"] += len(comments)

            elif source_name == "catchtable":
                if isinstance(info, list):
                    entry["total_reviews"] += len(info)
                    for review in info:
                        try:
                            rating = float(review[0])
                        except (IndexError, ValueError, TypeError):
                            continue
                        entry["rating_sum"] += rating
                        entry["rated_count"] += 1

            # ✅ 원본 데이터 보관
            entry.setdefault(source_name, []).append({
                "original_name": raw_name,
                "data": info
            })

    # ✅ 평균 평점 계산
    for entry in merged.values():
        if entry["rated_count"] > 0:
            entry["average_rating"] = round(entry["rating_sum"] / entry["rated_count"], 2)
        else:
            entry["average_rating"] = 0.0
        entry.pop("rating_sum", None)
        entry.pop("rated_count", None)

    return merged

def load_and_merge_json(
    nm_path: Union[str, Path],
    ct_path: Union[str, Path],
    km_path: Union[str, Path]
) -> Dict[str, Dict[str, Any]]:
    with open(nm_path, encoding="utf-8") as f:
        data_nm = json.load(f)
    with open(ct_path, encoding="utf-8") as f:
        data_ct = json.load(f)
    with open(km_path, encoding="utf-8") as f:
        data_km = json.load(f)

    return merge_site_data(data_nm, data_ct, data_km)

if __name__ == "__main__":
    base_dir = Path(__file__).parent
    merged = load_and_merge_json(
        base_dir / "reviews_NM.json",
        base_dir / "reviews_ct.json",
        base_dir / "reviews_KM.json"
    )
    print(f"Merged {len(merged)} restaurants.")
    with open(base_dir / "merged_restaurants.json", "w", encoding="utf-8") as fout:
        json.dump(merged, fout, ensure_ascii=False, indent=2)
