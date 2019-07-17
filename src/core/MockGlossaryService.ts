import { IGlossaryService } from './IGlossaryService';
import { ITerm } from './ITerm';
import { TermUtil } from './TermUtil';
import { IWebPartContext } from '@microsoft/sp-webpart-base';

const LOREM_IPSUM = ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut ' +
  'labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
  'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
  'eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt ' +
  'Tate glossary definition for Young British Artists: Label applied to a loose group of artists who began '+
  'to exhibit together in 1988 and who became known for their openness to materials and processes ' +
  'perceived shock tactics and entrepreneurial attitude ' +
  '!sint occaecat cupidatat non proident ' +
  '$irure dolor in reprehenderit ' +
  'mollit anim id est laborum').split(' ');

 const HTML_LOREM_IPSUM = [
  '<p>Tenetur quod quidem in voluptatem corporis dolorum dicta sit pariatur porro quaerat autem ipsam odit quam beatae tempora quibusdam illum! Modi velit odio nam nulla unde amet odit pariatur at!</p>',
  '<ul><li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li><li>Aliquam tincidunt mauris eu risus.</li><li>Vestibulum auctor dapibus neque.</li></ul>',
  '<p>You’ve probably heard of <a href="http://www.webpagefx.com/tools/lorem-ipsum-generator/">Lorem Ipsum</a> before – it’s the most-used dummy text excerpt out there. People use it because it has a fairly normal distribution of letters and words (making it look like normal English), but it’s also Latin, which means your average reader won’t get distracted by trying to read it. It’s perfect for showcasing design work as it should look when fleshed out with text, because it allows viewers to focus on the design work itself, instead of the text. It’s also a great way to showcase the functionality of programs like word processors, font types, and more.</p>',
  '<p>In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that\'s filled with content hourly on the day of going live. </p>',
  '<p>We’ve taken Lorem Ipsum to the next level with our HTML-Ipsum tool. As you can see, this Lorem Ipsum is tailor-made for websites and other online projects that are based in HTML. Most <a href="http://www.webpagefx.com/How-much-should-web-site-cost.html">web design projects</a> use Lorem Ipsum excerpts to begin with, but you always have to spend an annoying extra minute or two formatting it properly for the web. </p> ',
  '<p>No matter the project, please remember to replace your fancy HTML-Ipsum with real content before you go live - this is especially important if you\'re planning to implement a <a href="http://www.webpagefx.com/content-marketing-strategy.html">content-based marketing strategy</a> for your new creation! Lorem Ipsum text is all well and good to demonstrate a design or project, but if you set a website loose on the Internet without replacing dummy text with relevant, <a href="http://www.webpagefx.com/content-marketing/elements-of-high-quality-content.html">high quality content</a>, you’ll run into all sorts of potential <a href="http://www.webpagefx.com/SEO-Pricing.html">Search Engine Optimization</a> issues like thin content, duplicate content, and more.</p>',
  '<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>',
  '<p>Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>',
  '<p>But I must explain to you how all <a href="/abbreviations/implicit-names/">implicit tag name resolver</a> this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system.</p>'
  ]; 

/**
 * @class
 * Defines a service to request mock data to use the web part with the local workbench
 */
export class MockGlossaryService implements IGlossaryService  {
    private context: IWebPartContext;
    private listName:string;
    /**
     * @function
     * Service constructor
     */
    constructor(pageContext: IWebPartContext, listName:string){
        this.context = pageContext;
        this.listName = listName;
    }

    private allTerms:ITerm[];


    /**
   * @function
   * Gets the number of all term definitions
   */
    public getTermCount(): Promise<number>
    {
        return new Promise<number>((resolve) => {
             this.getAllTerms().then((allTerms: ITerm[]) => 
             {
                resolve(allTerms.length);
            });
        });
    }

    /**
     * @function
     * Gets the list of all term definitions
     */
    public getAllTerms(): Promise<ITerm[]>{
        return new Promise<ITerm[]>((resolve) => {
            if(this.allTerms == null)
            {
                this.allTerms = this.createTerms(this.getTotalCount());
                TermUtil.sortTerms(this.allTerms);
            }
            resolve(this.allTerms);
        });

    }

      /**
   * @function
   * Checks if a term name already exists
   */
    public checkIfTermExists(termName:string): Promise<Boolean>
    {
      return new Promise<Boolean>((resolve) => {
            this.getAllTerms().then((allTerms: ITerm[]) => 
            {
                var result:Boolean = false;
                const len = allTerms.length;

                for (var i = 0; i < len; i++) 
                {
                    var value = allTerms[i];
                    if (value.title.toLowerCase() == termName.toLowerCase()) 
                    {
                        result = true;
                        break;
                    }
                }

                resolve(result);
            });
        });

    }

    /**
     * @function
     * Create a term
     */
    public createTerm(term:ITerm): Promise<ITerm>{

      return new Promise<ITerm>((resolve) => {
            this.getAllTerms().then((allTerms: ITerm[]) => 
            {
                term.itemId = 'item-' + (allTerms.length) + ' ' + this.lorem(4);
                allTerms.push(term);
                TermUtil.sortTerms(allTerms);
                resolve(term);
            });
        });
    }

    /**
     * @function
     * Update a term
     */
    public updateTerm(term:ITerm): Promise<boolean>{
      return new Promise<boolean>((resolve) => {
            this.getAllTerms().then((allTerms: ITerm[]) => 
            {
                var ok = false;
                const index = this.findIndex(term.itemId, allTerms);

                if (index > -1) {
                    allTerms[index].title = term.title;
                    allTerms[index].definition = term.definition;
                    allTerms[index].synonyms = term.synonyms;

                    TermUtil.sortTerms(allTerms);
                    ok = true;
                }
                resolve(ok);

           });
        });
    }

    /**
     * @function
     * Delete a term
     */
    public deleteTerm(itemId:string): Promise<boolean>
    {
      return new Promise<boolean>((resolve) => {
            this.getAllTerms().then((allTerms: ITerm[]) => 
            {
                var ok = false;
                const index = this.findIndex(itemId, allTerms);

                if (index > -1) {
                    allTerms.splice(index, 1);
                    TermUtil.sortTerms(allTerms);
                    ok = true;
                }

                resolve(ok);

           });
        });
    }

    private findIndex(itemId:string, terms:ITerm[]) :number
    {
        var value:ITerm = null;
        const len = terms.length;

        for (var i = 0; i < len; i++) 
        {
            value = terms[i];
            if (value.itemId == itemId) 
            {
                return i;
            }
        }
        return -1;
    }

    private createTerms(count: number, letterKey?:string, startIndex = 0): ITerm[] {
        return Array.apply(null, Array(count)).map((item, index) => {
            return {
                itemId: 'item-' + (index + startIndex) + ' ' + this.lorem(4),
                title: (letterKey ? letterKey : "") + this.lorem(5),
                definition: this.htmlLorem(Math.random() * 4),
                created: new Date('2017-04-24T11:41:41Z'),
                lastModified: new Date(),
                createdBy:  this.context.pageContext.user.displayName,
                modifiedBy: this.context.pageContext.user.displayName,
                synonyms: (index % 5) == 0 ? [this.lorem(4), this.lorem(6), this.lorem(8)].join(';') : null
            };
        });
    }

    private htmlLorem(wordCount: number): string {
        return this.randWord(HTML_LOREM_IPSUM);
    }

    private lorem(wordCount: number): string {
        return Array.apply(null, Array(wordCount))
            .map(item => this.randWord(LOREM_IPSUM))
            .join(' ');
    }

    private randWord(array: string[]) {
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    private getTotalCount():number{

        var nbTotal = 300;
        if(this.listName == "6770c83b-29e8-494b-87b6-468a2066bcc6")
        {
            nbTotal = 300;
        }else if (this.listName == "2ece98f2-cc5e-48ff-8145-badf5009754c")
        {
            nbTotal = 1000;
        }else if(this.listName == "bd5dbd33-0e8d-4e12-b289-b276e5ef79c2")
        {
            nbTotal = 3000;
        }
        return nbTotal;

    }
    
}