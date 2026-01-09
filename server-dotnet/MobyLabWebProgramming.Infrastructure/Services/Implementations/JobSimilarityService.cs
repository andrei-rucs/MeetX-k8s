using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace MobyLabWebProgramming.Infrastructure.Services.Implementations;

public class JobSimilarityService
{
    public static Task<string> RecommendJobs(string userInput)
    {
        if (string.IsNullOrWhiteSpace(userInput))
        {
            return Task.FromResult("");
        }

        var jobList = LoadJobTitles("job_titles_with_embeddings.csv");

        // Normalize user input for comparison
        var normalizedInput = userInput.ToLower().Trim();

        // Find exact match first
        var exactMatch = jobList.FirstOrDefault(j => j.ToLower() == normalizedInput);
        if (!string.IsNullOrEmpty(exactMatch))
        {
            return Task.FromResult(exactMatch);
        }

        // Find partial match (contains)
        var partialMatch = jobList.FirstOrDefault(j => j.ToLower().Contains(normalizedInput));
        if (!string.IsNullOrEmpty(partialMatch))
        {
            return Task.FromResult(partialMatch);
        }

        // Find similar match (user input contained in job title)
        var similarMatch = jobList.FirstOrDefault(j => normalizedInput.Contains(j.ToLower()));
        if (!string.IsNullOrEmpty(similarMatch))
        {
            return Task.FromResult(similarMatch);
        }

        // No match found
        return Task.FromResult("");
    }

    private static List<string> LoadJobTitles(string filePath)
    {
        var jobTitles = new List<string>();

        if (!File.Exists(filePath))
        {
            Console.WriteLine($"Job titles file not found: {filePath}");
            return jobTitles;
        }

        using (var reader = new StreamReader(filePath))
        {
            Regex CSVParser = new Regex(",(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))");
            var header = reader.ReadLine();
            if (header == null) return jobTitles;

            var headerColumns = CSVParser.Split(header);
            int titleIndex = Array.IndexOf(headerColumns, "JobTitle");

            if (titleIndex == -1)
            {
                Console.WriteLine("JobTitle column not found in CSV");
                return jobTitles;
            }

            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var columns = CSVParser.Split(line);
                if (columns.Length > titleIndex)
                {
                    var jobTitle = columns[titleIndex].Trim('"', ' ');
                    if (!string.IsNullOrWhiteSpace(jobTitle))
                    {
                        jobTitles.Add(jobTitle);
                    }
                }
            }
        }

        return jobTitles;
    }
}
