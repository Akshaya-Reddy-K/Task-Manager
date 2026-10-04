import pandas as pd
import requests
import matplotlib.pyplot as plt
import re
import os
from io import StringIO
from bs4 import BeautifulSoup

# CLEAN GROSS COLUMN

def clean_gross_column(gross_str):
    if pd.isna(gross_str):
        return None

    gross_str = str(gross_str)
    gross_str = re.sub(r'(?i)\s*(crore|million|billion)\s*', '', gross_str)
    gross_str = re.sub(r'[₹$,]', '', gross_str)

    try:
        return float(gross_str)
    except:
        return None


def extract_amount(value):
    if not value:
        return None

    value = value.lower()

    # Remove symbols
    value = re.sub(r'[₹$,]', '', value)

    match = re.search(r'(\d+\.?\d*)', value)
    if not match:
        return None

    number = float(match.group(1))

    if "crore" in value:
        return number * 1e7
    elif "million" in value:
        return number * 1e6
    elif "billion" in value:
        return number * 1e9

    return number



def scrape_and_plot_movies():
    URL = "https://en.wikipedia.org/wiki/List_of_highest-grossing_Telugu_films"

    save_path = "output"
    os.makedirs(save_path, exist_ok=True)

    excel_filename = os.path.join(save_path, "highest_grossing_telugu_films.xlsx")

    headers = {"User-Agent": "Mozilla/5.0"}

    print("\nScraping data from Wikipedia…")

    try:
        response = requests.get(URL, headers=headers)
        response.raise_for_status()

        tables = pd.read_html(StringIO(response.text))
        movie_table = tables[0]

        film_col = next((c for c in movie_table.columns if "film" in str(c).lower()), movie_table.columns[0])
        gross_col = next((c for c in movie_table.columns if "gross" in str(c).lower()), movie_table.columns[-1])
        year_col = next((c for c in movie_table.columns if "year" in str(c).lower()), None)

        # Clean data
        movie_table["Gross_Numeric"] = movie_table[gross_col].apply(clean_gross_column)
        movie_table = movie_table.dropna(subset=["Gross_Numeric"])

        if year_col:
            movie_table["Year_Clean"] = movie_table[year_col].astype(str).str.extract(r'(\d{4})')


        # Save Excel
        movie_table.to_excel(excel_filename, index=False)
        print("Excel saved at:", excel_filename)

        print("Generating graphs")

        # Graph 1: Top 10 Movies
        top_10 = movie_table.nlargest(10, "Gross_Numeric")
        plt.figure(figsize=(10, 6))
        plt.bar(top_10[film_col], top_10["Gross_Numeric"])
        plt.xticks(rotation=45)
        plt.title("Top 10 Highest-Grossing Telugu Films")
        plt.tight_layout()
        plt.savefig(os.path.join(save_path, "top10_films.png"))
        plt.close()

        # Graph 2: Gross by Year
        if "Year_Clean" in movie_table:
            gross_by_year = movie_table.groupby("Year_Clean")["Gross_Numeric"].sum()
            plt.figure()
            gross_by_year.plot(kind='bar')
            plt.title("Total Gross by Year")
            plt.savefig(os.path.join(save_path, "gross_by_year.png"))
            plt.close()

        # Graph 3: Films per Year
        if "Year_Clean" in movie_table:
            count_by_year = movie_table["Year_Clean"].value_counts().sort_index()
            plt.figure()
            count_by_year.plot(kind='bar')
            plt.title("Number of Films per Year")
            plt.savefig(os.path.join(save_path, "films_per_year.png"))
            plt.close()

        print("Graphs generated successfully!")

    except Exception as e:
        print("Error:", e)


# SEARCH MOVIE

def search_movie():
    movie_name = input("\nEnter movie name: ").strip().replace(" ", "_")
    url = f"https://en.wikipedia.org/wiki/{movie_name}"

    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print("Movie not found!")
        return

    soup = BeautifulSoup(response.text, "html.parser")
    info_box = soup.find("table", class_="infobox vevent")

    if not info_box:
        print("No details found!")
        return

    print("\n Movie Details:\n")

    data = {}

    for row in info_box.find_all("tr"):
        header = row.find("th")
        value = row.find("td")

        if header and value:
            key = header.text.strip()
            val = value.text.strip()
            data[key] = val

   
    fields = ["Directed by", "Starring", "Release date", "Budget", "Box office"]

    for field in fields:
        if field in data:
            print(f"{field} : {data[field]}")

    
    budget = extract_amount(data.get("Budget"))
    box_office = extract_amount(data.get("Box office"))

    if budget and box_office:
        plt.figure()
        labels = ["Budget", "Box Office"]
        values = [budget, box_office]

        plt.bar(labels, values)
        plt.title(f"{movie_name.replace('_',' ')}: Budget vs Box Office")
        plt.ylabel("Amount")

        os.makedirs("output", exist_ok=True)
        filename = f"output/{movie_name}_comparison.png"
        plt.savefig(filename)
        plt.close()

        print(f"\n Graph saved at: {filename}")

        # Profit calculation (bonus)
        profit = box_office - budget
        print(f" Estimated Profit: {profit}")

    else:
        print("\n Budget or Box Office data not available.")


# MAIN MENU

def main():
    while True:
        print("\n====== MENU ======")
        print("1. Analyze Telugu Movies (Graphs + Excel)")
        print("2. Search Any Movie")
        print("3. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            scrape_and_plot_movies()
        elif choice == "2":
            search_movie()
        elif choice == "3":
            print("Exiting...")
            break
        else:
            print("Invalid choice!")


if __name__ == "__main__":
    main()