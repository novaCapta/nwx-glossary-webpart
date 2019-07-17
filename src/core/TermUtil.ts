import  {StringUtil} from './StringUtil';
import  {ITerm} from './ITerm';
import {queryParameterByName} from './UrlParser';

/**
 * @class
 * Term utilities
 */
export class TermUtil 
{
  /**
   * @function parses synonyms delimeted string to array of strings
   * @param synonymsAsString 
   */
    public static convertSynonyms(synonymsAsString):string[]
    {
        if(synonymsAsString != null && synonymsAsString.length > 0)
        {
            var synonymArr = [];
            synonymsAsString.split(';').map((e)=>{
                var s=e.trim();
                if(s.length > 0) synonymArr.push(s);
            });
            return synonymArr;
        }
        return null;
    } 

    /**
     * Check if the term contains a given string
     * @param term 
     * @param text 
     * @param searchInDef 
     * @param searchInSynonym 
     */
    public static termContains(term:ITerm, text:string, searchInDef:boolean, searchInSynonym: boolean):boolean
    {
      if(text == null)
      {
        return false;
      }

      const textTr = text.trim();
      if(StringUtil.isNullOrEmpty(text))
      {
        return false;
      }

      const termTitle = term.title;

      // search in title
      if(StringUtil.contains(termTitle, textTr))
      {
        return true;
      }

      // search in synonym
      if(searchInSynonym)
      {
        var termSynonyms = this.convertSynonyms(term.synonyms);
        if(termSynonyms != null && termSynonyms.length > 0)
        {
          for(var n = 0; n<termSynonyms.length;n++)
          {
            const s = termSynonyms[n];
            if(StringUtil.contains(s, textTr))
            {
              return true;
            }
          }
        }
      }

      // search in def
      if(searchInDef)
      {
        var termDef = term.definition;
        if(!StringUtil.isNullOrEmpty(termDef))
        {
          termDef = StringUtil.stripTags(termDef);
          if(StringUtil.contains(termDef, textTr))
            return true;
        }
      }

      return false;    
    }

    public static getTermUrl(term:ITerm): string
    {
      var url = window.location.href.split('?')[0];
      url += "?term=" + encodeURIComponent(term.title);
      return url;

    }

    public static parseTermNameFromUrl()
    {
      return queryParameterByName(window.location.href, "term");
    }

    public static sortTerms(terms:ITerm[]) : ITerm[]
    {
      if(terms == null) return null;
      return terms.sort((a:ITerm, b:ITerm)=>{return a.title.localeCompare(b.title);});
    }

} 